import { toErrorResponse } from "@/lib/server/route-errors";
import { listCompletedPolls } from "@/lib/server/poll-service";

export async function GET(): Promise<Response> {
  try {
    const polls = await listCompletedPolls();
    return Response.json({ polls });
  } catch (error) {
    return toErrorResponse(error);
  }
}
