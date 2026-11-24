import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { EmptyState } from "@/components/empty-state";

const columns = [{ label: "Patient" }, { label: "Status" }, { label: "Ward", className: "hidden" }];

describe("DashboardTable", () => {
  it("shows skeleton rows, one bar per column, while it loads", () => {
    render(
      <DashboardTable columns={columns} loading loadingRows={3}>
        <tr>
          <td>Ada Obi</td>
        </tr>
      </DashboardTable>,
    );
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(body).toHaveAttribute("aria-busy", "true");
    expect(within(body).getAllByRole("row", { hidden: true })).toHaveLength(3);
    expect(screen.queryByText("Ada Obi")).not.toBeInTheDocument();
  });

  it("shows the shared empty state, which wins over loading", () => {
    render(
      <DashboardTable columns={columns} loading empty="No patients match your search.">
        {null}
      </DashboardTable>,
    );
    expect(screen.getByText("No patients match your search.")).toBeInTheDocument();
    expect(screen.getAllByRole("rowgroup")[1]).not.toHaveAttribute("aria-busy");
  });

  it("shows its rows once loaded", () => {
    render(
      <DashboardTable columns={columns}>
        <tr>
          <td>Ada Obi</td>
        </tr>
      </DashboardTable>,
    );
    expect(screen.getByText("Ada Obi")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("shows the picture (hidden from screen readers), title, text and action", () => {
    const { container } = render(
      <EmptyState
        title="No staff yet"
        description="Add your first team member."
        action={<button type="button">Add Staff</button>}
      />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("No staff yet")).toBeInTheDocument();
    expect(screen.getByText("Add your first team member.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Staff" })).toBeInTheDocument();
  });
});
