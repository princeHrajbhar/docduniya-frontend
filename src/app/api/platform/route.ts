import { cookies } from "next/headers";
import { operations, pathFor } from "@/lib/workspace/contract";
import { ACCESS_COOKIE, apiBaseUrl } from "@/lib/session-core";
export async function POST(request: Request) {
  const reply = (data: unknown, status = 200) =>
    Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return reply({ message: "Request origin not allowed" }, 403);
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token)
    return reply(
      { message: "Your session expired. Please sign in again." },
      401,
    );
  try {
    const multipart = request.headers
      .get("content-type")
      ?.startsWith("multipart/form-data");
    const form = multipart ? await request.formData() : undefined;
    const input = form
      ? JSON.parse(String(form.get("request")))
      : await request.json();
    const op = operations.find((o) => o.id === input.operationId);
    if (!op || /^\/(auth|webhooks|health)(\/|$)/.test(op.path))
      return reply({ message: "Operation unavailable" }, 404);
    const url = new URL(apiBaseUrl() + pathFor(op, input.path || {}));
    for (const parameter of op.parameters.filter(
      (p) => p.in === "query" && p.name,
    )) {
      const value = input.query?.[parameter.name!];
      if (value !== undefined && value !== "")
        url.searchParams.set(parameter.name!, String(value));
    }
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (op.method !== "GET") {
      if (
        typeof input.key !== "string" ||
        !/^[a-zA-Z0-9-]{16,100}$/.test(input.key)
      )
        return reply({ message: "Missing request identity" }, 400);
      headers["Idempotency-Key"] = input.key;
    }
    let payload: BodyInit | undefined =
      op.method === "GET" || input.body === undefined
        ? undefined
        : JSON.stringify(input.body);
    if (op.multipart) {
      const file = form?.get("file");
      if (!(file instanceof File) || file.size > 20 * 1024 * 1024)
        return reply({ message: "Choose a file of at most 20 MB" }, 400);
      const upload = new FormData();
      upload.set("file", file);
      for (const [key, value] of Object.entries(input.body || {}))
        if (value !== undefined)
          upload.set(
            key,
            typeof value === "object" ? JSON.stringify(value) : String(value),
          );
      delete headers["Content-Type"];
      payload = upload;
    }
    const upstream = await fetch(url, {
      method: op.method,
      headers,
      body: payload,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(25000),
    });
    const text = await upstream.text();
    let result: unknown;
    try {
      result = text ? JSON.parse(text) : { message: "Completed" };
    } catch {
      return reply({ message: "Unexpected server response" }, 502);
    }
    return reply(result, upstream.status === 204 ? 200 : upstream.status);
  } catch (error) {
    return reply(
      {
        message:
          error instanceof Error && error.message.startsWith("Choose ")
            ? error.message
            : "Unable to complete the request. Please retry.",
      },
      502,
    );
  }
}
