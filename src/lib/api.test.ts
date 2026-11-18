import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { env } from "@/env";
import { ApiSchemaError, getErrorMessage, request } from "@/lib/api";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";

const url = `${env.VITE_API_URL}/thing`;

describe("request", () => {
  it("returns parsed data when the response matches the schema", async () => {
    server.use(http.get(url, () => HttpResponse.json({ id: "1" })));
    await expect(request(z.object({ id: z.string() }), { url: "/thing" })).resolves.toEqual({
      id: "1",
    });
  });

  it("throws ApiSchemaError naming the endpoint when the shape changes", async () => {
    server.use(http.get(url, () => HttpResponse.json({ id: 1 })));
    const error = await request(z.object({ id: z.string() }), { url: "/thing" }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiSchemaError);
    expect(error.message).toContain("GET /thing");
  });

  it("refreshes the token once on 401 and retries", async () => {
    useAuthStore.getState().setSession({
      accessToken: "old",
      refreshToken: "r",
      user: { id: "u", name: "U", email: "u@example.com", role: "member" },
    });
    server.use(
      http.post(`${env.VITE_API_URL}/api/auth/refresh`, () =>
        HttpResponse.json({ data: { access_token: "mock-access" } }),
      ),
      http.get(url, ({ request }) =>
        request.headers.get("Authorization") === "Bearer mock-access"
          ? HttpResponse.json({ id: "1" })
          : new HttpResponse(null, { status: 401 }),
      ),
    );
    await expect(request(z.object({ id: z.string() }), { url: "/thing" })).resolves.toEqual({
      id: "1",
    });
    expect(useAuthStore.getState().session?.accessToken).toBe("mock-access");
  });
});

describe("getErrorMessage", () => {
  async function messageFor(status: number, body: unknown) {
    server.use(http.get(url, () => HttpResponse.json(body as object, { status })));
    return getErrorMessage(await request(z.unknown(), { url: "/thing" }).catch((e) => e));
  }

  it("reads DRF's detail", async () => {
    expect(await messageFor(400, { detail: "Invalid OTP", status: "error" })).toBe("Invalid OTP");
  });

  it("prefers message, then detail, then error", async () => {
    expect(await messageFor(400, { message: "Nope", detail: "Invalid OTP" })).toBe("Nope");
    expect(await messageFor(400, { error: { message: "Expired code" } })).toBe("Expired code");
  });

  it("names the field for DRF field errors, but not for non_field_errors", async () => {
    expect(await messageFor(400, { official_email: ["Already registered."] })).toBe(
      "official email: Already registered.",
    );
    expect(await messageFor(400, { non_field_errors: ["Passwords don't match."] })).toBe(
      "Passwords don't match.",
    );
  });

  it("falls back to the status text when the body says nothing useful", async () => {
    server.use(http.get(url, () => new HttpResponse("<html>Server Error</html>", { status: 500 })));
    const error = await request(z.unknown(), { url: "/thing" }).catch((e) => e);
    expect(getErrorMessage(error)).toBe("Request failed with status code 500");
  });

  it("explains a request that never got an answer (offline, CORS)", async () => {
    server.use(http.get(url, () => HttpResponse.error()));
    const error = await request(z.unknown(), { url: "/thing" }).catch((e) => e);
    expect(getErrorMessage(error)).toBe(
      "Couldn't reach DocuHealth. Check your connection and try again.",
    );
  });
});
