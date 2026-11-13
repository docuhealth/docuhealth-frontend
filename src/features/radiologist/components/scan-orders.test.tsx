import { screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ScanOrders } from "@/features/radiologist/components/scan-orders";
import type { Period } from "@/lib/period";
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

  it("says why each in-progress test is under way", async () => {
    const { user } = renderWithRouter(<ScanOrders period="week" onPeriodChange={() => {}} />);

    await user.click(await screen.findByRole("tab", { name: /In-Progress Test/ }));
    await screen.findByText("Showing 1 to 4 of 4 entries");
    const rows = await tableRows();
    expect(within(rows[0]!).getByText("Appt")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Doctor req")).toBeInTheDocument();
  });

  it("narrows the orders to today", async () => {
    function Page() {
      const [period, setPeriod] = useState<Period>("week");
      return <ScanOrders period={period} onPeriodChange={setPeriod} />;
    }
    const { user } = renderWithRouter(<Page />);
    await tableRows();

    await user.click(screen.getByRole("combobox", { name: "Period" }));
    await user.click(await screen.findByRole("option", { name: "Today" }));
    expect(await screen.findByRole("tab", { name: /Pending Test\s*2$/ })).toBeInTheDocument();
  });
});
