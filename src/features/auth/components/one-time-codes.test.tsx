import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { IndividualSignUp } from "@/features/auth/components/individual-sign-up";
import { PasswordReset } from "@/features/auth/components/password-reset";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { pickOption, renderWithRouter } from "@/test/render";

type User = ReturnType<typeof renderWithRouter>["user"];

/** Dev prefill may have filled the field (it's on with a local `.env.local`), so replace it. */
async function fill(user: User, field: HTMLElement, text: string) {
  await user.clear(field);
  await user.type(field, text);
}

// The mock API answers like staging since the SMS change: forgot-password takes `identifier`,
// sign-up says where the code went (masked), and `exists@…` already has an account.

describe("Password reset", () => {
  it("lets a patient reset with their phone number, by SMS", async () => {
    const { user } = renderWithRouter(<PasswordReset audience="individual" />);
    await fill(
      user,
      await screen.findByLabelText("Email address or phone number"),
      "0803 123 4567",
    );
    await user.click(screen.getByRole("button", { name: "Send code" }));

    expect(
      await screen.findByText("Enter the 6-digit code sent by SMS to 0803 123 4567"),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Create new password")).toBeInTheDocument();
  });

  it("only texts Nigerian numbers", async () => {
    const { user } = renderWithRouter(<PasswordReset audience="individual" />);
    await fill(
      user,
      await screen.findByLabelText("Email address or phone number"),
      "+44 20 7946 0958",
    );
    await user.click(screen.getByRole("button", { name: "Send code" }));
    expect(
      await screen.findByText(
        "Enter a valid email address, or a Nigerian phone number like 0803 123 4567",
      ),
    ).toBeInTheDocument();
  });

  it("asks staff for their email, since staff can't reset by phone", async () => {
    const { user } = renderWithRouter(<PasswordReset audience="hospital" />);
    await fill(user, await screen.findByLabelText("Email address"), "0803 123 4567");
    await user.click(screen.getByRole("button", { name: "Send code" }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("waits before sending another code, counting down", async () => {
    const { user } = renderWithRouter(<PasswordReset audience="individual" />);
    await fill(
      user,
      await screen.findByLabelText("Email address or phone number"),
      "ada@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Send code" }));

    const again = await screen.findByRole("button", { name: /Send again in (1:00|0:5\d)/ });
    expect(again).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit email" })).toBeInTheDocument();
  });
});

describe("Patient sign-up", () => {
  /** Step 1's details, with the contact left to the test. */
  async function fillDetails(user: User) {
    // Every sign-up step offers the way back to log in, under its button.
    expect(await screen.findByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    await fill(user, await screen.findByLabelText(/First name/), "Ada");
    await fill(user, screen.getByLabelText(/Last name/), "Okonkwo");
    await user.click(screen.getByRole("combobox", { name: /Gender/ }));
    await pickOption("Female");
    await fill(user, screen.getByLabelText(/Date of birth/), "12/04/1990");
    const terms = screen.getByRole("checkbox");
    if (terms.getAttribute("aria-checked") !== "true") await user.click(terms);
  }

  it("asks for a Nigerian phone number and an email, and texts the code to the phone", async () => {
    let sent: Record<string, unknown> | undefined;
    server.use(
      http.post(`${env.VITE_API_URL}/api/auth/signup`, async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ destination: "+234••••••4567" });
      }),
    );
    const { user } = renderWithRouter(<IndividualSignUp />);
    await fillDetails(user);
    expect(screen.getByText("We’ll text your code to this number.")).toBeInTheDocument();
    await fill(user, screen.getByLabelText(/Email/), "ada@example.com");

    await fill(user, screen.getByLabelText(/Phone Number/), "0803 123");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByText("Enter a Nigerian phone number, e.g. 0803 123 4567"),
    ).toBeInTheDocument();

    await fill(user, screen.getByLabelText(/Phone Number/), "0803 123 4567");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByText("Enter the 6-digit code sent by SMS to +234••••••4567"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send again in/ })).toBeDisabled();
    // Both are sent; verify_by says which one gets the code.
    expect(sent).toMatchObject({
      phone: "0803 123 4567",
      email: "ada@example.com",
      verify_by: "phone",
    });

    // "Edit number" goes back to step 1 with the number kept.
    await user.click(screen.getByRole("button", { name: "Edit number" }));
    expect(await screen.findByLabelText(/Phone Number/)).toHaveValue("0803 123 4567");
  });

  it("switches to email, and sends an existing account to log in", async () => {
    const { user } = renderWithRouter(<IndividualSignUp />);
    await fillDetails(user);
    await user.click(screen.getByRole("button", { name: "Use email instead" }));
    expect(screen.getByText("We’ll email your code to this address.")).toBeInTheDocument();
    // The phone is still required and sent, even when the code goes to the email.
    await fill(user, screen.getByLabelText(/Phone Number/), "0803 123 4567");
    await fill(user, screen.getByLabelText(/Email/), "exists@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("Enter the 6-digit code sent by email to e***@example.com"),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("You already have an account")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Reset password" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    // An email may have an old (v1) sign-up left unfinished.
    expect(screen.getByRole("link", { name: "Finish an earlier sign-up" })).toHaveAttribute(
      "href",
      "/verify-account?email=exists%40example.com",
    );
  });

  it("only offers to finish an earlier sign-up for an email, not a phone", async () => {
    server.use(
      http.post(`${env.VITE_API_URL}/api/auth/signup/verify-code`, () =>
        HttpResponse.json(
          { code: "account_exists", detail: "An account already uses this contact." },
          { status: 409 },
        ),
      ),
    );
    const { user } = renderWithRouter(<IndividualSignUp />);
    await fillDetails(user);
    await fill(user, screen.getByLabelText(/Phone Number/), "0803 123 4567");
    await fill(user, screen.getByLabelText(/Email/), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.type(await screen.findByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("You already have an account")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reset password" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Finish an earlier sign-up" })).toBeNull();
  });

  it("ends with the HIN and a way to the login page, without signing them in", async () => {
    const { user } = renderWithRouter(<IndividualSignUp />);
    await fillDetails(user);
    await fill(user, screen.getByLabelText(/Phone Number/), "0803 123 4567");
    await fill(user, screen.getByLabelText(/Email/), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.type(await screen.findByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await fill(user, await screen.findByRole("textbox", { name: /^NIN/ }), "12345678901");
    await fill(user, screen.getByLabelText(/^Password/), "Password123!");
    await fill(user, screen.getByLabelText(/Confirm Password/), "Password123!");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText(/Log in with your phone number and the password you just set/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(useAuthStore.getState().session).toBeNull();
  });
});
