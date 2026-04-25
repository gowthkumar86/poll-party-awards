import { ApiRouteError, toErrorResponse } from "@/lib/server/route-errors";
import { validatePollAccess } from "@/lib/server/poll-service";

type ValidatePayload = {
  poll_id?: string;
  pollId?: string;
  password?: string;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = (await request.json()) as ValidatePayload;
    const pollId = payload.poll_id ?? payload.pollId ?? "";
    const password = payload.password ?? "";

    if (!pollId.trim()) {
      throw new ApiRouteError("poll_id is required", 400);
    }
    if (!password.trim()) {
      throw new ApiRouteError("password is required", 400);
    }

    const success = await validatePollAccess(pollId, password);
    return Response.json({ success });
  } catch (error) {
    return toErrorResponse(error);
  }
}
