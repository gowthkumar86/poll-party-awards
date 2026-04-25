export class ApiRouteError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiRouteError";
    this.status = status;
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof ApiRouteError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("[api-route-error]", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
