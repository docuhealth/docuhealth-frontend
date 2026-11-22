import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Wallet } from "@/features/hospital-admin/components/wallet";
import { renderWithProviders } from "@/test/render";

describe("Wallet", () => {
  it("says the balance isn't available yet, and shows the plans", async () => {
    renderWithProviders(<Wallet />);
    expect(await screen.findByText("Free plan")).toBeInTheDocument();
    expect(screen.getByText("Not available yet")).toBeInTheDocument();
    const plans = screen.getByRole("region", { name: "Subscription plans" });
    expect(within(plans).getByText("₦10,000")).toBeInTheDocument();
    expect(within(plans).getByText("₦117,000")).toBeInTheDocument();
  });

  it("subscribes to a plan, opening Paystack's checkout", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderWithProviders(<Wallet />);
    await user.click(await screen.findByRole("button", { name: "Choose Monthly Plan" }));
    const dialog = await screen.findByRole("dialog", { name: "Choose Monthly Plan" });
    await user.click(within(dialog).getByRole("button", { name: "Continue to payment" }));

    expect(
      await screen.findByText("Finish paying on Paystack. Your plan starts once it’s paid."),
    ).toBeInTheDocument();
    expect(open).toHaveBeenCalledWith("https://checkout.paystack.com/mock", "_blank", "noopener");
    // The mock takes the payment at once.
    expect(await screen.findByRole("button", { name: "Current plan" })).toBeDisabled();
    open.mockRestore();
  });
});
