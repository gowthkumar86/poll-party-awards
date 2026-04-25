import type {
  CompletedPollSummary,
  CreatePollInput,
  DashboardData,
  PollBundle,
  PollStatus,
  SubmitVotesInput,
} from "./types";

const API_TIMEOUT_MS = 15000;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), API_TIMEOUT_MS);

  try {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(path, {
      ...init,
      signal: init?.signal ?? timeoutController.signal,
      headers,
    });

    let payload: unknown = null;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      const textPayload = await response.text();
      payload = textPayload ? { error: textPayload } : null;
    }

    if (!response.ok) {
      const errorMessage =
        typeof payload === "object" && payload && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : `Request failed (${response.status})`;
      throw new Error(errorMessage);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please check that the backend is running and try again.");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("API request failed");
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  async createPoll(input: CreatePollInput): Promise<{ id: string }> {
    const payload = await requestJson<{ poll_id?: string; id?: string }>("/api/poll/create", {
      method: "POST",
      body: JSON.stringify(input),
    });

    const pollId = payload.poll_id ?? payload.id;
    if (!pollId) {
      throw new Error("Poll created but no poll id was returned by the server.");
    }

    return { id: pollId };
  },

  async getPoll(id: string, password: string): Promise<PollBundle> {
    return requestJson<PollBundle>(`/api/poll/${encodeURIComponent(id)}`, {
      headers: { "x-poll-password": password },
    });
  },

  async submitVotes(input: SubmitVotesInput): Promise<{ ok: true }> {
    await requestJson<{ success: true }>("/api/poll/submit", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return { ok: true as const };
  },

  async closePoll(id: string, password: string): Promise<{ ok: true }> {
    await requestJson<{ success: true }>("/api/poll/close", {
      method: "POST",
      body: JSON.stringify({ pollId: id, password }),
    });

    return { ok: true as const };
  },

  async getDashboard(id: string, password: string): Promise<DashboardData> {
    return requestJson<DashboardData>(`/api/poll/results/${encodeURIComponent(id)}`, {
      headers: { "x-poll-password": password },
    });
  },

  async pollExists(id: string): Promise<{ exists: boolean; status?: PollStatus; title?: string }> {
    return requestJson<{ exists: boolean; status?: PollStatus; title?: string }>(
      `/api/poll/exists/${encodeURIComponent(id)}`,
    );
  },

  async listCompletedPolls(): Promise<CompletedPollSummary[]> {
    const payload = await requestJson<{ polls: CompletedPollSummary[] }>("/api/poll/completed");
    return payload.polls;
  },
};

const sessionKey = (id: string) => `friendpoll.session.${id}`;

export const session = {
  save(pollId: string, data: { password: string; voterName?: string }) {
    sessionStorage.setItem(sessionKey(pollId), JSON.stringify(data));
  },
  load(pollId: string): { password: string; voterName?: string } | null {
    const raw = sessionStorage.getItem(sessionKey(pollId));
    return raw ? JSON.parse(raw) : null;
  },
  clear(pollId: string) {
    sessionStorage.removeItem(sessionKey(pollId));
  },
};
