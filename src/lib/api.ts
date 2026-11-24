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

/** The machine-readable `code` of an API error (e.g. `account_exists`), if it has one. */
export function errorCode(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const code = (error.response?.data as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : undefined;
}

/** The API refused because of too many requests (429), e.g. a code resent too soon. */
export function isThrottled(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 429;
}

/**
 * How many seconds a 429 asks us to wait (its `Retry-After` header). `null` for any other error,
 * or when the header isn't there or the browser can't read it.
 */
export function retryAfterSeconds(error: unknown): number | null {
  if (!isAxiosError(error) || !isThrottled(error) || !error.response) return null;
  const header = Number(error.response.headers["retry-after"]);
  return Number.isFinite(header) && header > 0 ? Math.ceil(header) : null;
}

/**
 * Fields that only describe the response, never what went wrong, when their value is a plain
 * label (`"code": "account_exists"`). As a list they're a field error (`"code": ["Wrong code"]`).
 */
const envelopeKeys = new Set(["status", "code", "success", "status_code"]);

/** Field errors that read fine without the field's name: a one-time code is the only field. */
const unnamedFields = new Set(["non_field_errors", "code", "otp"]);

/**
 * The first readable message in an error body. Covers `{ message }`, `{ detail }` (Django REST
 * Framework), `{ error: "…" | { message } }`, and DRF field errors (`{ nin: ["…"] }`), which are
 * shown as "nin: …" unless they're `non_field_errors` or a one-time code's.
 */
function messageFromBody(body: unknown, field?: string): string | undefined {
  if (typeof body === "string") {
    const text = body.trim();
    // An HTML error page (e.g. a Django 500) is no use in a toast.
    if (!text || text.startsWith("<")) return undefined;
    return field && !unnamedFields.has(field) ? `${field.replaceAll("_", " ")}: ${text}` : text;
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
    if ((envelopeKeys.has(key) && !Array.isArray(value)) || key === "data") continue;
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

/**
 * A one-time code was sent (sign-up, desk sign-up): `destination` is where to, masked (`a***@example.com`,
 * `+234••••••1234`). TODO(api): the schema doesn't document it, so it's read from the body or
 * its `data`, and may be missing.
 */
export const codeSentResponseSchema = z
  .looseObject({
    destination: z.string().optional(),
    data: z.looseObject({ destination: z.string().optional() }).nullish(),
  })
  .transform((body) => ({ destination: body.destination ?? body.data?.destination ?? null }));
