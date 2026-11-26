import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import { env } from "@/env";
import { restoreSession } from "@/features/auth/api/session";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";

const me = `${env.VITE_API_URL}/api/auth/me`;
const refresh = `${env.VITE_API_URL}/api/auth/refresh`;

afterEach(() => useAuthStore.getState().clearSession());

describe("restoreSession", () => {
  it("rebuilds the session from GET /api/auth/me", async () => {
    server.use(
      http.get(me, () =>
        HttpResponse.json({
          status: "success",
          data: {
            role: "hospital_staff",
            next_step: null,
            acting_as: [
              {
                facility: { id: "fac1", name: "ABC Hospital", type: "hospital" },
                staff_role: "nurse",
                is_admin: false,
              },
            ],
          },
        }),
      ),
    );
    await restoreSession();
    const session = useAuthStore.getState().session;
    expect(session?.accountType).toBe("staff");
    expect(session?.user.role).toBe("nurse");
  });

  it("keeps a pending gate step, so the person is sent to it", async () => {
    server.use(
      http.get(me, () =>
        HttpResponse.json({
          data: { role: "patient", next_step: "nin_not_verified", acting_as: [{ as: "self" }] },
        }),
      ),
    );
    await restoreSession();
    expect(useAuthStore.getState().session?.nextStep).toBe("nin_not_verified");
  });

  it("stays signed out when /me and the refresh both refuse", async () => {
    let refreshes = 0;
    server.use(
      http.get(me, () => HttpResponse.json({ detail: "No session" }, { status: 401 })),
      http.post(refresh, () => {
        refreshes += 1;
        return HttpResponse.json({ detail: "Please login again" }, { status: 400 });
      }),
    );
    await restoreSession();
    expect(refreshes).toBe(1);
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("drops the login data older versions saved in the browser", async () => {
    localStorage.setItem("auth", JSON.stringify({ state: { session: { accessToken: "old" } } }));
    server.use(http.get(me, () => HttpResponse.json({ detail: "No session" }, { status: 401 })));
    await restoreSession();
    expect(localStorage.getItem("auth")).toBeNull();
  });
});
