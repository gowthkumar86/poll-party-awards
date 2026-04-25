import { ApiRouteError, toErrorResponse } from "@/lib/server/route-errors";
import { getPasswordFromRequest, getPollBundle } from "@/lib/server/poll-service";

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
    const pollData = await getPollBundle(id, password);
    return Response.json(pollData);
  } catch (error) {
    return toErrorResponse(error);
  }
}
