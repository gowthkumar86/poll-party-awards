import { toErrorResponse } from "@/lib/server/route-errors";
import { pollExists } from "@/lib/server/poll-service";

export async function GET(
  _request: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await Promise.resolve(context.params);
    const result = await pollExists(id);
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
