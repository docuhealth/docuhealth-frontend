import type { AxiosRequestConfig } from "axios";
import { isAxiosError } from "axios";
import { z } from "zod";
import { http } from "@/lib/http";

/** The backend answered, but not with the shape we expect. */
export class ApiSchemaError extends Error {
  readonly endpoint: string;
  readonly zodError: z.ZodError;

  constructor(endpoint: string, zodError: z.ZodError) {
    super(`Unexpected response from ${endpoint}:\n${z.prettifyError(zodError)}`);
    this.name = "ApiSchemaError";
    this.endpoint = endpoint;
    this.zodError = zodError;
  }
}

/**
 * The only way features talk to the backend: send the request, then validate the
 * response against `schema` so a changed API fails here, not deep inside a screen.
 */
export async function request<TSchema extends z.ZodType>(
  schema: TSchema,
  config: AxiosRequestConfig,
): Promise<z.output<TSchema>> {
  const { data } = await http.request<unknown>(config);
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiSchemaError(`${config.method ?? "GET"} ${config.url}`, result.error);
  }
  return result.data;
}

/**
 * Best-effort human message for any error thrown by `request`.
 * @public
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Couldn't reach DocuHealth. Check your connection and try again.";
    }
    return messageFromBody(error.response.data) ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

/** Fields that only describe the response, never what went wrong. */
const envelopeKeys = new Set(["status", "code", "success", "status_code"]);

/**
 * The first readable message in an error body. Covers `{ message }`, `{ detail }` (Django REST
 * Framework), `{ error: "…" | { message } }`, and DRF field errors (`{ nin: ["…"] }`), which are
 * shown as "nin: …" unless they're `non_field_errors`.
 */
function messageFromBody(body: unknown, field?: string): string | undefined {
  if (typeof body === "string") {
    const text = body.trim();
    // An HTML error page (e.g. a Django 500) is no use in a toast.
    if (!text || text.startsWith("<")) return undefined;
    return field && field !== "non_field_errors" ? `${field.replaceAll("_", " ")}: ${text}` : text;
  }
  if (Array.isArray(body)) {
    for (const item of body) {
      const message = messageFromBody(item, field);
      if (message) return message;
    }
    return undefined;
  }
  if (typeof body !== "object" || body === null) return undefined;

  const record = body as Record<string, unknown>;
  for (const key of ["message", "detail", "error", "errors"]) {
    const message = messageFromBody(record[key]);
    if (message) return message;
  }
  for (const [key, value] of Object.entries(record)) {
    if (envelopeKeys.has(key) || key === "data") continue;
    const message = messageFromBody(value, key);
    if (message) return message;
  }
  return messageFromBody(record.data);
}

/**
 * A page of a DRF list endpoint (`{count, next, previous, results}`), as `{total, items}`. Pass
 * the page and size you asked for as `page`/`size` query params.
 */
export function paginated<TItem extends z.ZodType>(item: TItem) {
  return z
    .object({ count: z.number().int().nonnegative(), results: z.array(item) })
    .transform(({ count, results }) => ({ total: count, items: results }));
}
