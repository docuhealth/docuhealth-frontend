import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestOrders } from "@/features/lab-scientist/components/test-orders";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

describe("TestOrders", () => {
  it("lists the week's orders by stage, as a table or a grid", async () => {
    const { user } = renderWithRouter(<TestOrders period="week" onPeriodChange={() => {}} />);

    expect(await screen.findByRole("heading", { name: "Test Records" })).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: /Pending Test\s*20/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Rejected Test Order\s*3/ })).toBeInTheDocument();
    expect(await screen.findByText("Showing 1 to 7 of 20 entries")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /In-Progress Test/ }));
    await screen.findByText("Showing 1 to 4 of 4 entries");
    const table = screen.getByRole("table");
    // TODO(api): no source says whether a test was booked or asked for ("Appt"/"Doctor req").
    expect(within(table).getAllByText("In progress")).toHaveLength(4);

    await user.click(screen.getByRole("button", { name: "Grid view" }));
    const cards = await screen.findByRole("list", { name: "Test records" });
    expect(within(cards).getAllByRole("link", { name: /View details of/ })).toHaveLength(4);
  });

  it("has no Result Approval tab for a lab scientist", async () => {
    renderWithRouter(<TestOrders period="week" onPeriodChange={() => {}} />);
    expect(await screen.findByRole("tab", { name: /Pending Test/ })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Result Approval/ })).not.toBeInTheDocument();
  });

  describe("as the lab's admin", () => {
    afterEach(() => useAuthStore.getState().clearSession());

    it("adds a Result Approval tab of the orders with results to approve (as in v1)", async () => {
      useAuthStore.getState().setSession({
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
      const { user } = renderWithRouter(<TestOrders period="week" onPeriodChange={() => {}} />);
      const tab = await screen.findByRole("tab", { name: /Result Approval\s*[1-9]/ });
      await user.click(tab);
      const table = await screen.findByRole("table");
      expect(within(table).getAllByRole("link", { name: /^View / }).length).toBeGreaterThan(0);
    });
  });
});
