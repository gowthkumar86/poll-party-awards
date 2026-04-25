import { createPoll } from "@/lib/server/poll-service";
import { toErrorResponse } from "@/lib/server/route-errors";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json();
    const pollId = await createPoll(payload);
    return Response.json({ poll_id: pollId });
  } catch (error) {
    return toErrorResponse(error);
  }
}
