import { ApiRouteError, toErrorResponse } from "@/lib/server/route-errors";
import { getPasswordFromRequest, getPollResults } from "@/lib/server/poll-service";

export async function GET(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
): Promise<Response> {
  try {
    const password = getPasswordFromRequest(request);
    if (!password) {
      throw new ApiRouteError("password is required", 400);
    }

    const { id } = await Promise.resolve(context.params);
    const results = await getPollResults(id, password);
    return Response.json(results);
  } catch (error) {
    return toErrorResponse(error);
  }
}
