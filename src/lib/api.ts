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
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
