import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { FinishOldSignup } from "@/features/auth/components/finish-old-signup";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

type User = ReturnType<typeof renderWithRouter>["user"];

/** Dev prefill may have filled the field (it's on with a local `.env.local`), so replace it. */
async function fill(user: User, field: HTMLElement, text: string) {
  await user.clear(field);
  await user.type(field, text);
}

// The mock API: `old@…` has an unfinished old sign-up, and code 123456 finishes it.

describe("Finishing an old sign-up", () => {
  it("sends a code to the email, then verifies it and sends them to log in", async () => {
    let sent: Record<string, unknown> | undefined;
    server.use(
      http.post(`${env.VITE_API_URL}/api/auth/resend-otp`, async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ email: sent.email });
      }),
    );
    const { user, router } = renderWithRouter(<FinishOldSignup defaultEmail="old@example.com" />);
    expect(await screen.findByLabelText("Email address")).toHaveValue("old@example.com");
    await user.click(screen.getByRole("button", { name: "Send code" }));

    expect(
      await screen.findByText("Enter the 6-digit code sent by email to old@example.com"),
    ).toBeInTheDocument();
    expect(sent).toMatchObject({ email: "old@example.com" });
    expect(screen.getByRole("button", { name: /Send again in/ })).toBeDisabled();

    await fill(user, screen.getByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("Your account is verified. Log in to carry on."),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    // The reply doesn't sign them in.
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("shows the API's message for a wrong code and stays on the code", async () => {
    const { user } = renderWithRouter(<FinishOldSignup />);
    await fill(user, await screen.findByLabelText("Email address"), "old@example.com");
    await user.click(screen.getByRole("button", { name: "I already have a code" }));

    expect(
      await screen.findByText("Enter the 6-digit code sent by email to old@example.com"),
    ).toBeInTheDocument();
    // They had a code already, so they can ask for a new one straight away.
    expect(screen.getByRole("button", { name: "Send again" })).toBeEnabled();

    await fill(user, screen.getByLabelText("Verification code"), "654321");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Invalid OTP")).toBeInTheDocument();
    expect(screen.getByLabelText("Verification code")).toBeInTheDocument();
  });

  it("waits as long as the API asks when a code was sent too recently", async () => {
    server.use(
      http.post(`${env.VITE_API_URL}/api/auth/resend-otp`, () =>
        HttpResponse.json(
          { detail: "Request was throttled." },
          { status: 429, headers: { "Retry-After": "75" } },
        ),
      ),
    );
    const { user } = renderWithRouter(<FinishOldSignup defaultEmail="old@example.com" />);
    await user.click(await screen.findByRole("button", { name: "Send code" }));

    expect(await screen.findByRole("button", { name: /Send again in 1:1\d/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "I already have a code" })).toBeEnabled();
  });

  it("asks for a valid email first", async () => {
    const { user } = renderWithRouter(<FinishOldSignup />);
    await fill(user, await screen.findByLabelText("Email address"), "0803 123 4567");
    await user.click(screen.getByRole("button", { name: "Send code" }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
  });
});
