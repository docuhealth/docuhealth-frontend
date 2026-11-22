import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminDashboard } from "@/features/hospital-admin/components/admin-dashboard";
import { renderWithRouter } from "@/test/render";

describe("AdminDashboard", () => {
  it("shows the team's size, and dashes for the numbers the API doesn't send yet", async () => {
    renderWithRouter(<AdminDashboard period="month" onPeriodChange={() => {}} />);
    const total = (await screen.findByText("Total Staff")).closest("div")!.parentElement!;
    // The signed-in member plus 11 colleagues.
    expect(total).toHaveTextContent("12");
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("Not available yet")).toBeInTheDocument();
  });

  it("uploads a banner photo, then deletes it", async () => {
    const { user } = renderWithRouter(<AdminDashboard period="month" onPeriodChange={() => {}} />);
    await screen.findByText("Total Staff");
    const photo = new File(["banner"], "ward.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Banner photo"), photo);
    expect(await screen.findByText("Banner photo updated.")).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector("img[src$='ward.png']")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Banner photo options" }));
    await user.click(await screen.findByRole("menuitem", { name: /Delete Photo/ }));
    expect(await screen.findByText("Banner photo deleted.")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector("img[src$='ward.png']")).not.toBeInTheDocument(),
    );
  });
});
