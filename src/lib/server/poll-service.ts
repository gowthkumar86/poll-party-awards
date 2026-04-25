import type { Player, Poll, Question, Response as PollResponse } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/server/prisma";
import { ApiRouteError } from "@/lib/server/route-errors";

const PASSWORD_SALT_ROUNDS = 10;

type PollStatus = "active" | "closed";

type CreatePollPayload = {
  title?: string;
  password?: string;
  questions?: Array<{ text?: string }>;
  playerNames?: string[];
};

type SubmitVotesPayload = {
  pollId?: string;
  poll_id?: string;
  voterName?: string;
  password?: string;
  answers?: Record<string, string>;
};

type PollClient = {
  id: string;
  title: string;
  status: PollStatus;
  createdAt: number;
};

type QuestionClient = {
  id: string;
  pollId: string;
  text: string;
  order: number;
};

type PlayerClient = {
  id: string;
  pollId: string;
  name: string;
  hasSubmitted: boolean;
};

function assertRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiRouteError(`${fieldName} is required`, 400);
  }
  return value.trim();
}

function toClientPoll(poll: Poll): PollClient {
  return {
    id: poll.id,
    title: poll.title,
    status: poll.status as PollStatus,
    createdAt: poll.created_at.getTime(),
  };
}

function toClientQuestion(question: Question, order: number): QuestionClient {
  return {
    id: question.id,
    pollId: question.poll_id,
    text: question.text,
    order,
  };
}

function toClientPlayer(player: Player): PlayerClient {
  return {
    id: player.id,
    pollId: player.poll_id,
    name: player.name,
    hasSubmitted: player.has_submitted,
  };
}

function roundTo(value: number, digits: number): number {
  const precision = 10 ** digits;
  return Math.round(value * precision) / precision;
}

function normalizeQuestions(questions: Array<{ text?: string }> | undefined): string[] {
  if (!Array.isArray(questions)) {
    throw new ApiRouteError("questions must be an array", 400);
  }

  const cleaned = questions.map((q) => (q?.text ?? "").trim()).filter(Boolean);
  if (cleaned.length === 0) {
    throw new ApiRouteError("Add at least one question", 400);
  }

  return cleaned;
}

function normalizePlayerNames(names: string[] | undefined): string[] {
  if (!Array.isArray(names)) {
    throw new ApiRouteError("playerNames must be an array", 400);
  }

  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const rawName of names) {
    if (typeof rawName !== "string") continue;
    const name = rawName.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(name);
  }

  if (cleaned.length < 2) {
    throw new ApiRouteError("Add at least 2 participants", 400);
  }

  return cleaned;
}

export function getPasswordFromRequest(request: Request): string | null {
  const fromHeader = request.headers.get("x-poll-password");
  if (typeof fromHeader === "string" && fromHeader.trim()) {
    return fromHeader.trim();
  }

  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("password");
  if (typeof fromQuery === "string" && fromQuery.trim()) {
    return fromQuery.trim();
  }

  return null;
}

async function getPollById(pollId: string): Promise<Poll> {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
  });

  if (!poll) {
    throw new ApiRouteError("Poll not found", 404);
  }

  return poll;
}

export async function validatePollAccess(pollId: string, password: string): Promise<boolean> {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    select: { password_hash: true },
  });

  if (!poll) {
    return false;
  }

  return bcrypt.compare(password, poll.password_hash);
}

export async function requirePollWithPassword(pollId: string, password: string): Promise<Poll> {
  const cleanId = assertRequiredString(pollId, "poll_id");
  const cleanPassword = assertRequiredString(password, "password");
  const poll = await getPollById(cleanId);

  const success = await bcrypt.compare(cleanPassword, poll.password_hash);
  if (!success) {
    throw new ApiRouteError("Wrong password", 401);
  }

  return poll;
}

export async function createPoll(payload: CreatePollPayload): Promise<string> {
  const title = assertRequiredString(payload.title, "title");
  const password = assertRequiredString(payload.password, "password");
  const questions = normalizeQuestions(payload.questions);
  const playerNames = normalizePlayerNames(payload.playerNames);
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  const pollId = await prisma.$transaction(async (tx) => {
    const poll = await tx.poll.create({
      data: {
        title,
        password_hash: passwordHash,
      },
      select: { id: true },
    });

    await tx.question.createMany({
      data: questions.map((text) => ({
        poll_id: poll.id,
        text,
      })),
    });

    await tx.player.createMany({
      data: playerNames.map((name) => ({
        poll_id: poll.id,
        name,
      })),
    });

    return poll.id;
  });

  return pollId;
}

export async function getPollBundle(pollId: string, password: string) {
  const poll = await requirePollWithPassword(pollId, password);

  const [questions, players] = await Promise.all([
    prisma.question.findMany({
      where: { poll_id: poll.id },
      orderBy: { id: "asc" },
    }),
    prisma.player.findMany({
      where: { poll_id: poll.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    poll: toClientPoll(poll),
    questions: questions.map((question, index) => toClientQuestion(question, index)),
    players: players.map(toClientPlayer),
  };
}

export async function closePoll(pollId: string, password: string): Promise<void> {
  const poll = await requirePollWithPassword(pollId, password);

  await prisma.poll.update({
    where: { id: poll.id },
    data: { status: "closed" },
  });
}

export async function submitVotes(payload: SubmitVotesPayload): Promise<void> {
  const pollId = assertRequiredString(payload.pollId ?? payload.poll_id, "poll_id");
  const voterName = assertRequiredString(payload.voterName, "voterName");
  const password = assertRequiredString(payload.password, "password");
  const answers = payload.answers ?? {};

  if (typeof answers !== "object" || Array.isArray(answers)) {
    throw new ApiRouteError("answers must be an object", 400);
  }

  await prisma.$transaction(async (tx) => {
    const poll = await tx.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      throw new ApiRouteError("Poll not found", 404);
    }

    const success = await bcrypt.compare(password, poll.password_hash);
    if (!success) {
      throw new ApiRouteError("Wrong password", 401);
    }

    if (poll.status !== "active") {
      throw new ApiRouteError("Poll is closed", 400);
    }

    const [players, questions] = await Promise.all([
      tx.player.findMany({
        where: { poll_id: poll.id },
      }),
      tx.question.findMany({
        where: { poll_id: poll.id },
        orderBy: { id: "asc" },
      }),
    ]);

    const voter = players.find((player) => player.name.toLowerCase() === voterName.toLowerCase());
    if (!voter) {
      throw new ApiRouteError("Name not in this poll", 404);
    }

    if (voter.has_submitted) {
      throw new ApiRouteError("This name already voted", 409);
    }

    const selectedNameLookup = new Map(players.map((player) => [player.name.toLowerCase(), player.name]));
    const responseRows = questions.map((question) => {
      const selectedRaw = answers[question.id];
      const selectedKey = selectedRaw?.trim().toLowerCase();
      const selectedName = selectedKey ? selectedNameLookup.get(selectedKey) : undefined;

      if (!selectedName) {
        throw new ApiRouteError("Answer every question", 400);
      }

      return {
        poll_id: poll.id,
        question_id: question.id,
        selected_player_name: selectedName,
      };
    });

    const updateResult = await tx.player.updateMany({
      where: {
        id: voter.id,
        has_submitted: false,
      },
      data: {
        has_submitted: true,
      },
    });

    if (updateResult.count === 0) {
      throw new ApiRouteError("This name already voted", 409);
    }

    await tx.response.createMany({
      data: responseRows,
    });
  });
}

type QuestionResultClient = {
  question: QuestionClient;
  totalVotes: number;
  ranking: Array<{
    name: string;
    votes: number;
    percentage: number;
    rank: number;
    isWinner: boolean;
    isTie: boolean;
  }>;
};

type PlayerStatsClient = {
  name: string;
  totalVotesReceived: number;
  titlesWon: number;
  perCategory: Array<{
    questionId: string;
    questionText: string;
    votes: number;
    percentage: number;
  }>;
  mvpScore: number;
};

function buildQuestionResults(
  questions: Question[],
  players: Player[],
  responses: PollResponse[],
): QuestionResultClient[] {
  const responsesByQuestion = responses.reduce<Map<string, PollResponse[]>>((acc, response) => {
    const rows = acc.get(response.question_id);
    if (rows) {
      rows.push(response);
    } else {
      acc.set(response.question_id, [response]);
    }
    return acc;
  }, new Map());

  const playerNames = players.map((player) => player.name);

  return questions.map((question, index) => {
    const counts = new Map<string, number>(playerNames.map((name) => [name, 0]));
    const rows = responsesByQuestion.get(question.id) ?? [];

    for (const response of rows) {
      if (!counts.has(response.selected_player_name)) continue;
      counts.set(response.selected_player_name, (counts.get(response.selected_player_name) ?? 0) + 1);
    }

    const totalVotes = Array.from(counts.values()).reduce((sum, votes) => sum + votes, 0);
    const sorted = Array.from(counts.entries())
      .map(([name, votes]) => ({ name, votes }))
      .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));

    let lastVotes = Number.NaN;
    let lastRank = 0;
    const ranked = sorted.map((row, rowIndex) => {
      const rank = row.votes === lastVotes ? lastRank : rowIndex + 1;
      lastVotes = row.votes;
      lastRank = rank;
      return {
        ...row,
        rank,
      };
    });

    const topVotes = ranked[0]?.votes ?? 0;
    const winnerCount = ranked.filter((row) => row.votes === topVotes && topVotes > 0).length;

    return {
      question: toClientQuestion(question, index),
      totalVotes,
      ranking: ranked.map((row) => ({
        ...row,
        percentage: totalVotes === 0 ? 0 : roundTo((row.votes / totalVotes) * 100, 1),
        isWinner: row.rank === 1 && row.votes > 0,
        isTie: row.rank === 1 && winnerCount > 1,
      })),
    };
  });
}

function buildPlayerStats(
  players: Player[],
  questionResults: QuestionResultClient[],
  questionsCount: number,
  totalResponses: number,
): PlayerStatsClient[] {
  const denominator = questionsCount * totalResponses;

  return players.map((player) => {
    const perCategory = questionResults.map((result) => {
      const row = result.ranking.find((rankingRow) => rankingRow.name === player.name);
      return {
        questionId: result.question.id,
        questionText: result.question.text,
        votes: row?.votes ?? 0,
        percentage: row?.percentage ?? 0,
      };
    });

    const totalVotesReceived = perCategory.reduce((sum, category) => sum + category.votes, 0);
    const titlesWon = questionResults.filter((result) =>
      result.ranking.some((row) => row.name === player.name && row.rank === 1 && row.votes > 0),
    ).length;

    return {
      name: player.name,
      totalVotesReceived,
      titlesWon,
      perCategory,
      mvpScore: denominator === 0 ? 0 : roundTo((totalVotesReceived / denominator) * 100, 2),
    };
  });
}

function buildInsights(questionResults: QuestionResultClient[], playerStats: PlayerStatsClient[]) {
  const sortedByVotes = [...playerStats].sort(
    (a, b) => b.totalVotesReceived - a.totalVotesReceived || a.name.localeCompare(b.name),
  );

  const mostTargeted = sortedByVotes[0]
    ? { name: sortedByVotes[0].name, votes: sortedByVotes[0].totalVotesReceived }
    : undefined;
  const leastNoticed = sortedByVotes[sortedByVotes.length - 1]
    ? {
        name: sortedByVotes[sortedByVotes.length - 1].name,
        votes: sortedByVotes[sortedByVotes.length - 1].totalVotesReceived,
      }
    : undefined;

  let mostChaotic: { name: string; votes: number } | undefined;
  let highestPercentage = 0;
  for (const stat of playerStats) {
    for (const category of stat.perCategory) {
      if (category.percentage > highestPercentage) {
        highestPercentage = category.percentage;
        mostChaotic = { name: stat.name, votes: category.votes };
      }
    }
  }

  const top3Counts = new Map<string, number>();
  for (const result of questionResults) {
    for (const row of result.ranking.slice(0, 3)) {
      if (row.votes <= 0) continue;
      top3Counts.set(row.name, (top3Counts.get(row.name) ?? 0) + 1);
    }
  }

  const fanFavoriteEntry = Array.from(top3Counts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0];
  const fanFavorite = fanFavoriteEntry
    ? {
        name: fanFavoriteEntry[0],
        votes: playerStats.find((stat) => stat.name === fanFavoriteEntry[0])?.totalVotesReceived ?? 0,
      }
    : undefined;

  const sortedByTitles = [...playerStats].sort((a, b) => b.titlesWon - a.titlesWon || a.name.localeCompare(b.name));
  const mostTitles =
    sortedByTitles[0] && sortedByTitles[0].titlesWon > 0
      ? { name: sortedByTitles[0].name, titles: sortedByTitles[0].titlesWon }
      : undefined;

  return {
    mostTargeted,
    leastNoticed,
    mostChaotic,
    fanFavorite,
    mostTitles,
  };
}

export async function getPollResults(pollId: string, password: string) {
  const poll = await requirePollWithPassword(pollId, password);
  if (poll.status !== "closed") {
    throw new ApiRouteError("Dashboard available after poll closes", 400);
  }

  const [questions, players, responses] = await Promise.all([
    prisma.question.findMany({
      where: { poll_id: poll.id },
      orderBy: { id: "asc" },
    }),
    prisma.player.findMany({
      where: { poll_id: poll.id },
      orderBy: { name: "asc" },
    }),
    prisma.response.findMany({
      where: { poll_id: poll.id },
    }),
  ]);

  const questionResults = buildQuestionResults(questions, players, responses);
  const playerStats = buildPlayerStats(players, questionResults, questions.length, responses.length);
  const leaderboard = [...playerStats]
    .sort(
      (a, b) =>
        b.totalVotesReceived - a.totalVotesReceived ||
        b.titlesWon - a.titlesWon ||
        a.name.localeCompare(b.name),
    )
    .map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      totalVotes: entry.totalVotesReceived,
      titlesWon: entry.titlesWon,
      mvpScore: entry.mvpScore,
    }));

  const submittedCount = players.filter((player) => player.has_submitted).length;
  const completionRate = players.length === 0 ? 0 : roundTo(submittedCount / players.length, 4);
  const insights = buildInsights(questionResults, playerStats);

  return {
    poll: toClientPoll(poll),
    totals: {
      participants: players.length,
      questions: questions.length,
      responses: responses.length,
      completionRate,
    },
    questions: questionResults,
    players: playerStats,
    leaderboard,
    insights: {
      ...insights,
      totalResponses: responses.length,
    },
  };
}

export async function pollExists(pollId: string): Promise<{ exists: boolean; status?: PollStatus; title?: string }> {
  const cleanId = assertRequiredString(pollId, "poll_id");
  const poll = await prisma.poll.findUnique({
    where: { id: cleanId },
    select: {
      title: true,
      status: true,
    },
  });

  if (!poll) {
    return { exists: false };
  }

  return {
    exists: true,
    status: poll.status as PollStatus,
    title: poll.title,
  };
}

export async function listCompletedPolls(limit = 50): Promise<
  Array<{
    id: string;
    title: string;
    status: PollStatus;
    createdAt: number;
  }>
> {
  const polls = await prisma.poll.findMany({
    where: { status: "closed" },
    orderBy: { created_at: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      created_at: true,
    },
  });

  return polls.map((poll) => ({
    id: poll.id,
    title: poll.title,
    status: poll.status as PollStatus,
    createdAt: poll.created_at.getTime(),
  }));
}
