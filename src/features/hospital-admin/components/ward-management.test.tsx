import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WardManagement } from "@/features/hospital-admin/components/ward-management";
import { renderWithProviders } from "@/test/render";

/** The ward's card (found even while a dialog hides the page from assistive tech). */
async function cardOf(name: string) {
  const list = await screen.findByRole("list", { name: "Wards", hidden: true });
  return (await within(list).findByRole("heading", { name, hidden: true })).closest("li")!;
}

describe("WardManagement", () => {
  it("shows each ward's occupancy", async () => {
    renderWithProviders(<WardManagement />);
    const icu = await cardOf("ICU ward");
    expect(within(icu).getByText("Full")).toBeInTheDocument();
    expect(within(icu).getByText("8 of 8 beds taken")).toBeInTheDocument();
    expect(
      within(await cardOf("General ward")).getByText("6 of 20 beds taken"),
    ).toBeInTheDocument();
  });

  it("creates a ward", async () => {
    const { user } = renderWithProviders(<WardManagement />);
    await cardOf("General ward");
    await user.click(screen.getByRole("button", { name: "Create ward" }));
    const dialog = await screen.findByRole("dialog", { name: "Create ward" });
    await user.type(within(dialog).getByLabelText(/Ward name/), "Children's ward");
    await user.type(within(dialog).getByLabelText(/Number of beds/), "10");
    await user.click(within(dialog).getByRole("button", { name: "Create ward" }));
    expect(await screen.findByText("Children's ward is created.")).toBeInTheDocument();
    expect(
      within(await cardOf("Children's ward")).getByText("0 of 10 beds taken"),
    ).toBeInTheDocument();
  });

  it("won't shrink a ward below its taken beds, and lists its beds", async () => {
    const { user } = renderWithProviders(<WardManagement />);
    const general = await cardOf("General ward");
    await user.click(within(general).getByRole("button", { name: "Manage General ward" }));
    const dialog = await screen.findByRole("dialog", { name: "Manage General ward" });
    expect(await within(dialog).findByText("Bed 20")).toBeInTheDocument();

    const beds = within(dialog).getByLabelText(/Number of beds/);
    await user.clear(beds);
    await user.type(beds, "4");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(
      await within(dialog).findByText("6 beds are taken, so it needs at least 6"),
    ).toBeInTheDocument();
  });

  it("deletes an empty ward, and passes on the API's refusal for one in use", async () => {
    const { user } = renderWithProviders(<WardManagement />);
    await user.click(
      within(await cardOf("Surgical ward")).getByRole("button", { name: "Delete Surgical ward" }),
    );
    let dialog = await screen.findByRole("dialog", { name: "Delete ward" });
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("Surgical ward is deleted.")).toBeInTheDocument();

    await user.click(
      within(await cardOf("ICU ward")).getByRole("button", { name: "Delete ICU ward" }),
    );
    dialog = await screen.findByRole("dialog", { name: "Delete ward" });
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(await screen.findByText(/can't be deleted/)).toBeInTheDocument();
  });
});
