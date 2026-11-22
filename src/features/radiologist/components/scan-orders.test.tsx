import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScanOrders } from "@/features/radiologist/components/scan-orders";
import { renderWithRouter } from "@/test/render";

async function tableRows() {
  const table = await screen.findByRole("table");
  return within(table).getAllByRole("row").slice(1);
}

describe("ScanOrders", () => {
  it("shows this week's pending tests seven to a page", async () => {
    renderWithRouter(<ScanOrders period="week" onPeriodChange={() => {}} />);

    expect(await screen.findByRole("heading", { name: "Scan Orders" })).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: /Pending Test\s*20/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /In-Progress Test\s*4/ })).toBeInTheDocument();
    expect(await tableRows()).toHaveLength(7);
    expect(screen.getByText("Showing 1 to 7 of 20 entries")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
  });

  // TODO(api): the items don't say whether a scan was booked or a doctor asked for it ("Appt" or
  // "Doctor req"), and can't be filtered by date, so neither is tested until the API has them.
  it("lists the scans under way", async () => {
    const { user } = renderWithRouter(<ScanOrders period="week" onPeriodChange={() => {}} />);

    await user.click(await screen.findByRole("tab", { name: /In-Progress Test/ }));
    await screen.findByText("Showing 1 to 4 of 4 entries");
    const rows = await tableRows();
    expect(within(rows[0]!).getByText("In progress")).toBeInTheDocument();
  });
});
