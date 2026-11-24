import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { AddFacilityDialog } from "@/features/hospital-admin/components/add-facility-dialog";
import { server } from "@/mocks/node";
import { pickOption, renderWithRouter } from "@/test/render";

type User = ReturnType<typeof renderWithRouter>["user"];

/** Dev prefill may have filled the field (it's on with a local `.env.local`), so replace it. */
async function fill(user: User, field: HTMLElement, text: string) {
  await user.clear(field);
  await user.type(field, text);
}

describe("AddFacilityDialog", () => {
  it("sends the facility's name and address, and the hospital login for its admin", async () => {
    let sent: Record<string, unknown> | undefined;
    server.use(
      http.post(`${env.VITE_API_URL}/api/auth/facility/arms`, async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ sqid: "arm-1" }, { status: 201 });
      }),
    );
    const { user } = renderWithRouter(<AddFacilityDialog open onOpenChange={() => {}} />);
    const dialog = await screen.findByRole("dialog", { name: "Add Facilities" });

    await user.click(within(dialog).getByRole("combobox", { name: /Facility/ }));
    await pickOption("Pharmacy");
    await fill(user, within(dialog).getByLabelText(/Facility name/), "LUTH Pharmacy");
    await user.click(within(dialog).getByRole("combobox", { name: /State/ }));
    await pickOption("Lagos");
    await user.click(within(dialog).getByRole("combobox", { name: /City \/ LGA/ }));
    await pickOption("Alimosho");
    await fill(user, within(dialog).getByLabelText(/Street address/), "1 Ishaga Road");
    await fill(user, within(dialog).getByLabelText(/Admin first name/), "Joe");
    await fill(user, within(dialog).getByLabelText(/Admin last name/), "Doe");
    await fill(user, within(dialog).getByLabelText(/Admin phone number/), "080-123-456-78");
    await fill(user, within(dialog).getByLabelText(/Admin email address/), "joe@luth.example.com");
    await user.click(within(dialog).getByRole("button", { name: "Add Facility" }));

    expect(
      await screen.findByText(
        "LUTH Pharmacy (Pharmacy) is set up, and Joe Doe is its admin. They can now add and manage staff.",
      ),
    ).toBeInTheDocument();
    expect(sent).toMatchObject({
      facility_type: "pharmacy",
      name: "LUTH Pharmacy",
      state: "Lagos",
      city: "Alimosho",
      street: "1 Ishaga Road",
      country: "Nigeria",
    });
    // The admin's welcome email must open the hospital login, not the patients' one.
    expect(String(sent?.login_url)).toMatch(/\/\/hospital\.[^/]+\/login$/);
  });

  it("asks for the facility's name and address", async () => {
    const { user } = renderWithRouter(<AddFacilityDialog open onOpenChange={() => {}} />);
    const dialog = await screen.findByRole("dialog", { name: "Add Facilities" });
    await user.clear(within(dialog).getByLabelText(/Facility name/));
    await user.clear(within(dialog).getByLabelText(/Street address/));
    await user.click(within(dialog).getByRole("button", { name: "Add Facility" }));
    expect(await within(dialog).findByText("Enter the facility's name")).toBeInTheDocument();
    expect(within(dialog).getByText("Enter the street address")).toBeInTheDocument();
  });
});
