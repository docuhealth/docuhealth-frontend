import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScanOrderDetails } from "@/features/radiologist/components/scan-order-details";
import { renderWithRouter } from "@/test/render";

describe("RejectOrderFlow", () => {
  it("rejects a pending order with a note, which the page then shows", async () => {
    // A pending order (1–20 in the mock) no other test uses.
    const { user } = renderWithRouter(<ScanOrderDetails orderId="scan-order-10" />);
    await user.click(await screen.findByRole("button", { name: "Reject request" }));

    const dialog = await screen.findByRole("dialog", { name: "Reject scan order" });
    const note = within(dialog).getByLabelText(/Add note/);
    await user.clear(note);
    await user.click(within(dialog).getByRole("button", { name: "Reject request" }));
    expect(
      await within(dialog).findByText("Say why you’re rejecting this request"),
    ).toBeInTheDocument();

    await user.type(note, "Please send an ultrasound request instead.");
    await user.click(within(dialog).getByRole("button", { name: "Reject request" }));
    const rejected = await screen.findByRole("dialog", { name: "Order Rejected!" });
    await user.click(within(rejected).getByRole("button", { name: "Done" }));

    expect(await screen.findByRole("region", { name: "Reason for rejection" })).toHaveTextContent(
      "Please send an ultrasound request instead.",
    );
    expect(screen.queryByRole("button", { name: "Accept request" })).not.toBeInTheDocument();
  });
});
