import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecentUploadsCard } from "@/features/radiologist/components/recent-uploads-card";
import { ScanRecords } from "@/features/radiologist/components/scan-records";
import { ScanScheduleCard } from "@/features/radiologist/components/scan-schedule-card";
import { renderWithProviders, renderWithRouter } from "@/test/render";

/** The rows of the table view (the list view below it is hidden by a container query). */
async function tableRows() {
  const table = await screen.findByRole("table");
  // Skips the header row.
  return within(table).getAllByRole("row").slice(1);
}

describe("ScanRecords", () => {
  it("shows a page of pending orders, the newest unopened ones marked New", async () => {
    renderWithRouter(<ScanRecords />);

    expect(await screen.findByRole("tab", { name: /Pending Order\s*20/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Completed Scan\s*32/ })).toBeInTheDocument();
    const rows = await tableRows();
    expect(rows).toHaveLength(8);
    expect(within(rows[0]!).getByText("New")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("1d ago")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 to 8 of 20 entries")).toBeInTheDocument();
  });

  it("switches tabs, pages and sort order", async () => {
    const { user } = renderWithRouter(<ScanRecords />);

    await user.click(await screen.findByRole("tab", { name: /Rejected Scan/ }));
    await screen.findByText("Showing 1 to 3 of 3 entries");
    expect(await tableRows()).toHaveLength(3);
    expect(within((await tableRows())[0]!).getByText("Rejected")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Pending Order/ }));
    await user.click(await screen.findByRole("button", { name: "Page 3" }));
    await screen.findByText("Showing 17 to 20 of 20 entries");

    // Sorting starts over from the first page, oldest first.
    await user.click(screen.getByRole("button", { name: /Requested on, latest first/ }));
    await screen.findByText("Showing 1 to 8 of 20 entries");
    expect(screen.getByRole("button", { name: /Requested on, oldest first/ })).toBeInTheDocument();
    expect(within((await tableRows())[0]!).queryByText("New")).not.toBeInTheDocument();
  });

  it("searches by test name and says when nothing matches", async () => {
    const { user } = renderWithRouter(<ScanRecords />);
    await tableRows();

    const search = screen.getByRole("searchbox", { name: "Search scan records" });
    await user.type(search, "Brain MRI");
    await screen.findByText(/of 2 entries/);
    for (const row of await tableRows()) {
      expect(within(row).getByText("Brain MRI")).toBeInTheDocument();
    }

    await user.clear(search);
    await user.type(search, "zzz");
    expect(await screen.findAllByText("No scans match “zzz”.")).not.toHaveLength(0);
  });

  it("lays the orders out as cards in grid view", async () => {
    const { user } = renderWithRouter(<ScanRecords />);
    await tableRows();

    await user.click(screen.getByRole("button", { name: "Grid view" }));
    expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const cards = within(screen.getByRole("list", { name: "Scan records" })).getAllByRole(
      "listitem",
    );
    expect(cards).toHaveLength(6);
    expect(within(cards[0]!).getByText("Chest X-ray")).toBeInTheDocument();
    expect(within(cards[0]!).getByRole("link", { name: /View details/ })).toHaveAttribute(
      "href",
      "/hospital/radiologist/scan-orders/scan-order-1",
    );

    // The grid pages with the arrows beside the layout switch, not under the cards.
    expect(screen.queryByText(/Showing \d+ to/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByRole("button", { name: "Next page" }));
    // 20 pending orders: three full pages of six, then two.
    await waitFor(() =>
      expect(
        within(screen.getByRole("list", { name: "Scan records" })).getAllByRole("listitem"),
      ).toHaveLength(2),
    );
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});

describe("dashboard cards", () => {
  it("lists this week's booked scans", async () => {
    renderWithProviders(<ScanScheduleCard />);
    expect(await screen.findByText("Chidi Okafor")).toBeInTheDocument();
    // Booked twelve days out, so only in this month's view.
    expect(screen.queryByText("Joyce Sarah")).not.toBeInTheDocument();
  });

  it("shows each recent upload's status", async () => {
    renderWithProviders(<RecentUploadsCard />);
    const row = (await screen.findByText("Amaka Eze")).closest("tr")!;
    expect(within(row).getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
