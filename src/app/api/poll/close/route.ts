import { ApiRouteError, toErrorResponse } from "@/lib/server/route-errors";
import { closePoll } from "@/lib/server/poll-service";

type ClosePayload = {
  poll_id?: string;
  pollId?: string;
  password?: string;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = (await request.json()) as ClosePayload;
    const pollId = payload.poll_id ?? payload.pollId ?? "";
    const password = payload.password ?? "";

    if (!pollId.trim()) {
      throw new ApiRouteError("poll_id is required", 400);
    }
    if (!password.trim()) {
      throw new ApiRouteError("password is required", 400);
    }

    await closePoll(pollId, password);
    return Response.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
