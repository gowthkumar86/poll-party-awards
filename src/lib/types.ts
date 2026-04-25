// ============================================================================
// FriendPoll — Types
// ============================================================================
// Shared between the frontend UI and the data adapter.
// When you wire Next.js API routes + SQLite later, keep these shapes identical
// so you don't need to touch any UI code.
// ============================================================================

export type PollStatus = "active" | "closed";

export interface Poll {
  id: string;
  title: string;
  status: PollStatus;
  createdAt: number;
  // questions/players denormalized in the API responses below for convenience
}

export interface CompletedPollSummary {
  id: string;
  title: string;
  status: PollStatus;
  createdAt: number;
}

export interface Question {
  id: string;
  pollId: string;
  text: string;
  emoji?: string;
  order: number;
}

export interface Player {
  id: string;
  pollId: string;
  name: string;
  hasSubmitted: boolean;
}

export interface PollResponse {
  id: string;
  pollId: string;
  questionId: string;
  selectedPlayerName: string;
  // No voter identity stored — anonymity by design.
}

export interface PollBundle {
  poll: Poll;
  questions: Question[];
  players: Player[];
}

export interface CreatePollInput {
  title: string;
  password: string;
  questions: { text: string; emoji?: string }[];
  playerNames: string[];
}

export interface SubmitVotesInput {
  pollId: string;
  voterName: string;          // used for locking the player; never stored on responses
  password: string;
  answers: Record<string, string>; // questionId -> selectedPlayerName
}

// Aggregated dashboard payload
export interface QuestionResult {
  question: Question;
  totalVotes: number;
  ranking: { name: string; votes: number; percentage: number; rank: number; isWinner: boolean; isTie: boolean }[];
}

export interface PlayerStats {
  name: string;
  totalVotesReceived: number;
  titlesWon: number;
  perCategory: { questionId: string; questionText: string; emoji?: string; votes: number; percentage: number }[];
  mvpScore: number; // 0-100
}

export interface DashboardData {
  poll: Poll;
  totals: {
    participants: number;
    questions: number;
    responses: number;
    completionRate: number; // 0-1
  };
  questions: QuestionResult[];
  players: PlayerStats[];
  insights: {
    mostTargeted?: { name: string; votes: number };
    leastNoticed?: { name: string; votes: number };
    mostChaotic?: { name: string; votes: number };       // highest single-question dominance
    fanFavorite?: { name: string; votes: number };       // most "positive" — proxy: most distinct categories won
    mostTitles?: { name: string; titles: number };
    totalResponses: number;
  };
}
