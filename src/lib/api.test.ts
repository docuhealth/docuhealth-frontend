import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { env } from "@/env";
import { ApiSchemaError, errorCode, getErrorMessage, request, retryAfterSeconds } from "@/lib/api";
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

  const user = { id: "u", name: "U", email: "u@example.com", role: "member" };
  const refreshUrl = `${env.VITE_API_URL}/api/auth/refresh`;

  it("sends X-Requested-With on writes only, and never an Authorization header", async () => {
    const seen: { method: string; requested: string | null; auth: string | null }[] = [];
    const record = ({ request }: { request: Request }) => {
      seen.push({
        method: request.method,
        requested: request.headers.get("X-Requested-With"),
        auth: request.headers.get("Authorization"),
      });
      return HttpResponse.json({});
    };
    server.use(http.get(url, record), http.post(url, record), http.patch(url, record));
    await request(z.unknown(), { url: "/thing" });
    await request(z.unknown(), { method: "POST", url: "/thing", data: {} });
    await request(z.unknown(), { method: "PATCH", url: "/thing", data: {} });
    expect(seen).toEqual([
      { method: "GET", requested: null, auth: null },
      { method: "POST", requested: "XMLHttpRequest", auth: null },
      { method: "PATCH", requested: "XMLHttpRequest", auth: null },
    ]);
  });

  it("renews the session once on a 401 and retries, sharing one refresh between calls", async () => {
    useAuthStore.getState().setSession({ user });
    let renewed = false;
    let refreshes = 0;
    server.use(
      http.post(refreshUrl, ({ request }) => {
        refreshes += 1;
        expect(request.headers.get("X-Requested-With")).toBe("XMLHttpRequest");
        renewed = true;
        return HttpResponse.json({ data: {} });
      }),
      // The access cookie: expired until the refresh renews it.
      http.get(url, () =>
        renewed ? HttpResponse.json({ id: "1" }) : new HttpResponse(null, { status: 401 }),
      ),
    );
    const schema = z.object({ id: z.string() });
    await expect(
      Promise.all([request(schema, { url: "/thing" }), request(schema, { url: "/thing" })]),
    ).resolves.toEqual([{ id: "1" }, { id: "1" }]);
    expect(refreshes).toBe(1);
    expect(useAuthStore.getState().session).not.toBeNull();
  });

  it("ends the session when the refresh is refused", async () => {
    useAuthStore.getState().setSession({ user });
    server.use(
      http.post(refreshUrl, () => HttpResponse.json({ detail: "Expired" }, { status: 401 })),
      http.get(url, () => new HttpResponse(null, { status: 401 })),
    );
    await expect(request(z.unknown(), { url: "/thing" })).rejects.toBeDefined();
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("refreshes for the staff profile too (under /api/auth/), but not for a failed login", async () => {
    useAuthStore.getState().setSession({ user });
    let refreshes = 0;
    let renewed = false;
    const profile = `${env.VITE_API_URL}/api/auth/staff/profile`;
    server.use(
      http.post(refreshUrl, () => {
        refreshes += 1;
        renewed = true;
        return HttpResponse.json({ data: {} });
      }),
      http.get(profile, () =>
        renewed ? HttpResponse.json({ id: "me" }) : new HttpResponse(null, { status: 401 }),
      ),
      http.post(`${env.VITE_API_URL}/api/auth/login`, () =>
        HttpResponse.json({ detail: "Incorrect login details." }, { status: 401 }),
      ),
    );
    await expect(
      request(z.object({ id: z.string() }), { url: "/api/auth/staff/profile" }),
    ).resolves.toEqual({ id: "me" });
    expect(refreshes).toBe(1);

    const login = await request(z.unknown(), { method: "POST", url: "/api/auth/login" }).catch(
      (error: unknown) => error,
    );
    expect(getErrorMessage(login)).toBe("Incorrect login details.");
    // A wrong password doesn't trigger a refresh.
    expect(refreshes).toBe(1);
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

  it("reads a wrong code on the `code` field, but not a `code` label", async () => {
    expect(await messageFor(400, { code: ["Wrong or expired code."] })).toBe(
      "Wrong or expired code.",
    );
    expect(
      await messageFor(409, { code: "account_exists", detail: "You already have an account." }),
    ).toBe("You already have an account.");
  });

  it("falls back to the status text when the body says nothing useful", async () => {
    server.use(http.get(url, () => new HttpResponse("<html>Server Error</html>", { status: 500 })));
    const error = await request(z.unknown(), { url: "/thing" }).catch((e) => e);
    expect(getErrorMessage(error)).toBe("Request failed with status code 500");
  });

  it("reads an error's code and how long a 429 asks us to wait", async () => {
    server.use(
      http.get(url, () =>
        HttpResponse.json(
          { detail: "Request was throttled." },
          { status: 429, headers: { "Retry-After": "87" } },
        ),
      ),
    );
    const throttled = await request(z.unknown(), { url: "/thing" }).catch((e) => e);
    expect(retryAfterSeconds(throttled)).toBe(87);
    expect(errorCode(throttled)).toBeUndefined();

    server.use(http.get(url, () => HttpResponse.json({ code: "account_exists" }, { status: 409 })));
    const exists = await request(z.unknown(), { url: "/thing" }).catch((e) => e);
    expect(errorCode(exists)).toBe("account_exists");
    expect(retryAfterSeconds(exists)).toBeNull();
  });

  it("explains a request that never got an answer (offline, CORS)", async () => {
    server.use(http.get(url, () => HttpResponse.error()));
    const error = await request(z.unknown(), { url: "/thing" }).catch((e) => e);
    expect(getErrorMessage(error)).toBe(
      "Couldn't reach DocuHealth. Check your connection and try again.",
    );
  });
});
