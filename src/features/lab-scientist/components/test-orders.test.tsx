import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestOrders } from "@/features/lab-scientist/components/test-orders";
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
    expect(within(table).getByText("Appt")).toBeInTheDocument();
    expect(within(table).getAllByText("Doctor req")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Grid view" }));
    const cards = await screen.findByRole("list", { name: "Test records" });
    expect(within(cards).getAllByRole("link", { name: /View details of/ })).toHaveLength(4);
  });
});
