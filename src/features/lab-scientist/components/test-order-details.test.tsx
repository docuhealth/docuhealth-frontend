import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestOrderDetails } from "@/features/lab-scientist/components/test-order-details";
import { renderWithRouter } from "@/test/render";
import { useAuthStore } from "@/stores/auth-store";

// The mock's orders: 1–20 pending, 21–24 in progress (21 and 23 with their sample in),
// 25–56 completed, 57–59 rejected. Each test uses its own.

describe("TestOrderDetails", () => {
  it("accepts a pending order, then logs when the sample was collected", async () => {
    const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-3" />);
    await user.click(await screen.findByRole("button", { name: "Accept request" }));

    const confirm = await screen.findByRole("dialog", { name: "Confirm Test Acceptance" });
    await user.click(within(confirm).getByRole("button", { name: "Accept Request" }));
    const approved = await screen.findByRole("dialog", { name: "Order Approved!" });
    await user.click(within(approved).getByRole("button", { name: "Done" }));

    expect(await screen.findByText("In progress", { selector: "dd *" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Log sample collection" }));
    const sample = await screen.findByRole("dialog", { name: "Sample Collection Info" });
    // Order 3 was requested 30 hours ago, so 28 hours ago is after it and in the past.
    const taken = new Date(Date.now() - 28 * 60 * 60_000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = within(sample).getByLabelText(/Sample collection date/);
    await user.clear(date);
    await user.type(
      date,
      `${pad(taken.getDate())}/${pad(taken.getMonth() + 1)}/${taken.getFullYear()}`,
    );
    const time = within(sample).getByLabelText(/Sample collection time/);
    await user.clear(time);
    await user.type(time, `${pad(taken.getHours())}:${pad(taken.getMinutes())}`);
    await user.click(within(sample).getByRole("button", { name: /Submit entry/ }));

    expect(
      await screen.findByRole("button", { name: "Edit sample collection info" }),
    ).toBeInTheDocument();
  });

  it("rejects a pending order with a note, which the page then shows", async () => {
    const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-4" />);
    await user.click(await screen.findByRole("button", { name: "Reject request" }));

    const dialog = await screen.findByRole("dialog", { name: "Reject test request" });
    const note = within(dialog).getByLabelText(/Add note/);
    await user.clear(note);
    await user.click(within(dialog).getByRole("button", { name: "Reject request" }));
    expect(
      await within(dialog).findByText("Say why you’re rejecting this request"),
    ).toBeInTheDocument();

    await user.type(note, "Please send a fresh sample.");
    await user.click(within(dialog).getByRole("button", { name: "Reject request" }));
    const rejected = await screen.findByRole("dialog", { name: "Order Rejected!" });
    await user.click(within(rejected).getByRole("button", { name: "Done" }));

    expect(await screen.findByRole("region", { name: "Reason for rejection" })).toHaveTextContent(
      "Please send a fresh sample.",
    );
  });

  it("uploads results, flagging each against its range, then shows them", async () => {
    // In progress with its sample in, so the collection time is filled already.
    const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-21" />);
    await user.click(await screen.findByRole("button", { name: "Upload test result" }));

    const dialog = await screen.findByRole("dialog", { name: "Upload test result" });
    await user.click(within(dialog).getByRole("button", { name: /Upload result/ }));
    expect(await within(dialog).findAllByText("Enter a number")).not.toHaveLength(0);

    const inputs = within(dialog).getAllByRole("textbox", { name: / result/ });
    for (const input of inputs) await user.type(input, "999");
    expect(within(dialog).getAllByText("Critical high")).toHaveLength(inputs.length);
    await user.type(within(dialog).getByLabelText(/Approved interpretation/), "Very high.");
    await user.type(within(dialog).getByLabelText(/Clinical correlation/), "Repeat the test.");
    await user.click(within(dialog).getByRole("button", { name: /Upload result/ }));

    const confirm = await screen.findByRole("dialog", { name: "Confirm Upload" });
    await user.click(within(confirm).getByRole("button", { name: "Confirm Upload" }));
    const done = await screen.findByRole("dialog", { name: "Result uploaded!" });
    await user.click(within(done).getByRole("button", { name: "Done" }));

    const results = await screen.findByRole("region", { name: "Results" });
    expect(within(results).getAllByText("Critical high")).toHaveLength(inputs.length);
    expect(screen.getByRole("region", { name: "Interpretation" })).toHaveTextContent("Very high.");
  });

  describe("as the lab's admin", () => {
    function signInAsLabAdmin() {
      useAuthStore.getState().setSession({
        accessToken: "token",
        accountType: "staff",
        actingAs: [
          {
            staff_role: "lab_scientist",
            is_admin: true,
            facility: { id: "lab", type: "laboratory" },
          },
        ],
        user: { id: "lab-admin", name: "Relam Triom", email: "relam@lab.example.com", role: "" },
      });
    }
    afterEach(() => useAuthStore.getState().clearSession());

    it("approves the results waiting for review", async () => {
      signInAsLabAdmin();
      const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-31" />);
      await user.click(await screen.findByRole("button", { name: "Approve results" }));
      const dialog = await screen.findByRole("dialog", { name: "Approve results" });
      await user.click(within(dialog).getByRole("button", { name: "Approve" }));
      expect(await screen.findByText(/results are approved\./)).toBeInTheDocument();
      // Nothing is left to review.
      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Approve results" })).not.toBeInTheDocument(),
      );
    });

    it("returns results with a note, sending the test back to in progress", async () => {
      signInAsLabAdmin();
      const { user } = renderWithRouter(<TestOrderDetails orderId="test-order-36" />);
      await user.click(await screen.findByRole("button", { name: "Return results" }));
      const dialog = await screen.findByRole("dialog", { name: "Return results" });
      await user.click(within(dialog).getByRole("button", { name: "Return results" }));
      expect(
        await within(dialog).findByText("Say why the results need redoing"),
      ).toBeInTheDocument();

      await user.type(within(dialog).getByLabelText(/Add note/), "The sample was haemolysed.");
      await user.click(within(dialog).getByRole("button", { name: "Return results" }));
      expect(await screen.findByText(/results are sent back to the lab\./)).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: "Log sample collection" }),
      ).toBeInTheDocument();
    });

    it("isn't offered to a lab scientist who isn't the admin", async () => {
      renderWithRouter(<TestOrderDetails orderId="test-order-41" />);
      expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Approve results" })).not.toBeInTheDocument();
    });
  });
});
