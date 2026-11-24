import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IndividualSignUp } from "@/features/auth/components/individual-sign-up";
import { PasswordReset } from "@/features/auth/components/password-reset";
import { pickOption, renderWithRouter } from "@/test/render";

type User = ReturnType<typeof renderWithRouter>["user"];

/** Dev prefill may have filled the field (it's on with a local `.env.local`), so replace it. */
async function fill(user: User, field: HTMLElement, text: string) {
  await user.clear(field);
  await user.type(field, text);
}

// The mock API answers like staging since the SMS change: forgot-password takes `identifier`,
// sign-up says where the code went, `exists@…` already has an account, and `wait@…` is refused
// a second code (429, `Retry-After: 75`).

describe("Password reset", () => {
  it("lets a patient reset with their phone number", async () => {
    const { user } = renderWithRouter(<PasswordReset audience="individual" />);
    await fill(
      user,
      await screen.findByLabelText("Email address or phone number"),
      "0803 123 4567",
    );
    await user.click(screen.getByRole("button", { name: "Send code" }));

    expect(
      await screen.findByText(/Enter the 6-digit code we sent to 0803 123 4567\./),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify" }));
    expect(await screen.findByText("Create new password")).toBeInTheDocument();
  });

  it("asks staff for their email, since staff can't reset by phone", async () => {
    const { user } = renderWithRouter(<PasswordReset audience="hospital" />);
    await fill(user, await screen.findByLabelText("Email address"), "0803 123 4567");
    await user.click(screen.getByRole("button", { name: "Send code" }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("counts down when a new code is asked for too soon", async () => {
    const { user } = renderWithRouter(<PasswordReset audience="individual" />);
    await fill(
      user,
      await screen.findByLabelText("Email address or phone number"),
      "wait@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Send code" }));

    await user.click(await screen.findByRole("button", { name: "Resend Code" }));
    const waiting = await screen.findByRole("button", { name: /Resend Code in 1:1\d/ });
    expect(waiting).toBeDisabled();
    expect(screen.queryByText(/throttled/)).not.toBeInTheDocument();
  });
});

describe("Patient sign-up", () => {
  it("shows where the code went, and sends an existing account to log in", async () => {
    const { user } = renderWithRouter(<IndividualSignUp />);
    await fill(user, await screen.findByLabelText(/First name/), "Ada");
    await fill(user, screen.getByLabelText(/Last name/), "Okonkwo");
    await user.click(screen.getByRole("combobox", { name: /Gender/ }));
    await pickOption("Female");
    await fill(user, screen.getByLabelText(/Date of birth/), "12/04/1990");
    await fill(user, screen.getByLabelText(/Email/), "exists@example.com");
    await fill(user, screen.getByLabelText(/Phone Number/), "0803 123 4567");
    const terms = screen.getByRole("checkbox");
    if (terms.getAttribute("aria-checked") !== "true") await user.click(terms);
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText(/Enter the 6-digit code we sent to e\*\*\*@example\.com\./),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify" }));

    expect(await screen.findByText("You already have an account")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Reset password" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
