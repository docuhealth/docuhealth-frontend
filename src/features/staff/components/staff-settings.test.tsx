import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffSettings } from "@/features/staff/components/staff-settings";
import { renderWithRouter } from "@/test/render";

describe("StaffSettings", () => {
  it("edits the member's name and phone, which the page then shows", async () => {
    const { user } = renderWithRouter(<StaffSettings />);
    expect(
      await screen.findByText("Receptionist · Lagos University Teaching Hospital"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit personal details" });
    const first = within(dialog).getByLabelText(/First name/);
    await user.clear(first);
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(await within(dialog).findByText("Enter your first name")).toBeInTheDocument();

    await user.type(first, "Kemisola");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Your details are updated.")).toBeInTheDocument();
    expect(await screen.findByText("Kemisola Adewale")).toBeInTheDocument();
  });

  it("changes the email with the code sent to the new address", async () => {
    const { user } = renderWithRouter(<StaffSettings />);
    await user.click(await screen.findByRole("button", { name: "Change email" }));

    let dialog = await screen.findByRole("dialog", { name: "Change email" });
    await user.type(within(dialog).getByLabelText(/New email address/), "kemi@new.example.com");
    await user.click(within(dialog).getByRole("button", { name: "Send code" }));

    dialog = await screen.findByRole("dialog", { name: "Enter the code" });
    await user.type(within(dialog).getByLabelText("Verification code"), "000000");
    await user.click(within(dialog).getByRole("button", { name: "Confirm email" }));
    expect(await screen.findByText("Invalid OTP")).toBeInTheDocument();

    await user.clear(within(dialog).getByLabelText("Verification code"));
    await user.type(within(dialog).getByLabelText("Verification code"), "123456");
    await user.click(within(dialog).getByRole("button", { name: "Confirm email" }));
    expect(await screen.findByText("Your email is now kemi@new.example.com.")).toBeInTheDocument();
    expect(await screen.findByText("kemi@new.example.com")).toBeInTheDocument();
  });

  it("checks the new password before changing it, and shows the API's error", async () => {
    const { user } = renderWithRouter(<StaffSettings />);
    await user.click(await screen.findByRole("button", { name: "Change password" }));
    const dialog = await screen.findByRole("dialog", { name: "Change password" });

    await user.type(within(dialog).getByLabelText(/Current password/), "wrong-password");
    await user.type(within(dialog).getByLabelText(/^New password/), "short");
    await user.type(within(dialog).getByLabelText(/Confirm new password/), "different");
    await user.click(within(dialog).getByRole("button", { name: "Change password" }));
    expect(await within(dialog).findByText("Use at least 8 characters")).toBeInTheDocument();
    expect(within(dialog).getByText("Passwords do not match")).toBeInTheDocument();

    await user.clear(within(dialog).getByLabelText(/^New password/));
    await user.type(within(dialog).getByLabelText(/^New password/), "a-new-password");
    await user.clear(within(dialog).getByLabelText(/Confirm new password/));
    await user.type(within(dialog).getByLabelText(/Confirm new password/), "a-new-password");
    await user.click(within(dialog).getByRole("button", { name: "Change password" }));
    expect(await screen.findByText("old password: Wrong password.")).toBeInTheDocument();
  });
});
