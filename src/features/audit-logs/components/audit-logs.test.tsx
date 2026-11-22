import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuditLogs } from "@/features/audit-logs/components/audit-logs";
import { renderWithProviders } from "@/test/render";

describe("AuditLogs", () => {
  it("lists lab result downloads and opens one's record", async () => {
    const { user } = renderWithProviders(<AuditLogs description="Downloads." />);
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Fasting Blood Glucose")).closest("tr")!;
    expect(within(row).getByText("Tola Bello")).toBeInTheDocument();
    expect(within(row).getByText("Lab Scientist")).toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: /View/ }));
    const dialog = await screen.findByRole("dialog", { name: "Download details" });
    expect(within(dialog).getByText("Test Result Downloaded")).toBeInTheDocument();
    expect(within(dialog).getByText("5.2 mmol/L")).toBeInTheDocument();
    expect(within(dialog).getByText("Within normal limits.")).toBeInTheDocument();
  });

  it("switches to scan report downloads", async () => {
    const { user } = renderWithProviders(<AuditLogs description="Downloads." />);
    await screen.findByText("Fasting Blood Glucose", { selector: "td" });
    await user.click(screen.getByRole("tab", { name: /Radiology/ }));
    const table = screen.getByRole("table");
    expect(await within(table).findByText("Chest pain, rule out pneumonia")).toBeInTheDocument();
    expect(within(table).getByText("Emeka Obi")).toBeInTheDocument();
  });
});
