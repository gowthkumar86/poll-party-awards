import { submitVotes } from "@/lib/server/poll-service";
import { toErrorResponse } from "@/lib/server/route-errors";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json();
    await submitVotes(payload);
    return Response.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
