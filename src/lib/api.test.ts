import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { env } from "@/env";
import { ApiSchemaError, request } from "@/lib/api";
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
