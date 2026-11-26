import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LabDetailsCard } from "@/features/lab-scientist/components/lab-details-card";
import { labFacilityHandlers } from "@/mocks/lab-scientist";
import { server } from "@/mocks/node";
import { renderWithRouter } from "@/test/render";

describe("LabDetailsCard", () => {
  // The hospital admin's mock answers the facility endpoints by default; this is the lab's.
  beforeEach(() => server.use(...labFacilityHandlers));

  it("shows the lab's details and lets its admin correct them", async () => {
    const { user } = renderWithRouter(<LabDetailsCard />);

    expect(await screen.findByText("LUTH Central Laboratory")).toBeInTheDocument();
    expect(screen.getByText("Idi-Araba, Mushin, Lagos, Lagos, Nigeria")).toBeInTheDocument();
    expect(screen.getByText("08031234567")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit lab details" });
    const name = within(dialog).getByRole("textbox", { name: /Lab name/ });
    expect(name).toHaveValue("LUTH Central Laboratory");

    const city = within(dialog).getByRole("textbox", { name: /City/ });
    await user.clear(city);
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(await within(dialog).findByText("Enter the city")).toBeInTheDocument();

    await user.type(city, "Surulere");
    await user.clear(name);
    await user.type(name, "LUTH Diagnostics Lab");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Your lab’s details are updated.")).toBeInTheDocument();
    expect(await screen.findByText("LUTH Diagnostics Lab")).toBeInTheDocument();
    expect(screen.getByText("Idi-Araba, Mushin, Surulere, Lagos, Nigeria")).toBeInTheDocument();
  });
});
