import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScanOrderDetails } from "@/features/radiologist/components/scan-order-details";
import { renderWithRouter } from "@/test/render";

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const pad = (n: number) => String(n).padStart(2, "0");
const yesterdayText = `${pad(yesterday.getDate())}/${pad(yesterday.getMonth() + 1)}/${yesterday.getFullYear()}`;

describe("UploadResultFlow", () => {
  it("takes the report in three steps, confirms, then shows the completed order", async () => {
    // An in-progress order (21–24 in the mock) no other test uses.
    const { user } = renderWithRouter(<ScanOrderDetails orderId="scan-order-23" />);
    await user.click(await screen.findByRole("button", { name: "Upload test result" }));

    // Step 1 checks its fields before moving on.
    let dialog = await screen.findByRole("dialog", { name: "Report information" });
    const name = within(dialog).getByLabelText(/Name of reporter/);
    await user.clear(name);
    await user.click(within(dialog).getByRole("button", { name: "Continue" }));
    expect(await within(dialog).findByText("Enter the reporter’s name")).toBeInTheDocument();

    await user.type(name, "Dr. Ada Bello");
    await user.click(within(dialog).getByRole("combobox", { name: /Specialty/ }));
    // The list ignores the pointer while it opens.
    fireEvent.click(await screen.findByRole("option", { name: "Sonographer" }));
    const date = within(dialog).getByLabelText(/Date of reporting/);
    await user.clear(date);
    await user.type(date, yesterdayText);
    const time = within(dialog).getByLabelText(/Time of reporting/);
    await user.clear(time);
    await user.type(time, "09:30");
    await user.click(within(dialog).getByRole("button", { name: "Continue" }));

    dialog = await screen.findByRole("dialog", { name: "Scan report" });
    for (const [label, text] of [
      [/Clinical indication/, "Pain in the lower abdomen."],
      [/Findings/, "Normal uterus.\nNo free fluid."],
      [/Impression/, "A normal pelvic scan."],
      [/Recommendation/, "No follow-up needed."],
    ] as const) {
      const field = within(dialog).getByLabelText(label);
      await user.clear(field);
      await user.type(field, text);
    }
    await user.click(within(dialog).getByRole("button", { name: "Continue" }));

    dialog = await screen.findByRole("dialog", { name: "Attachments & comment" });
    const scan = new File(["scan"], "pelvis.png", { type: "image/png" });
    await user.upload(within(dialog).getByLabelText(/Attachments/), scan);
    await user.click(within(dialog).getByRole("button", { name: /Upload Report/ }));

    // Cancelling the confirmation goes back to the form as it was.
    let confirm = await screen.findByRole("dialog", { name: "Confirm Upload" });
    await user.click(within(confirm).getByRole("button", { name: "Cancel" }));
    dialog = await screen.findByRole("dialog", { name: "Attachments & comment" });
    expect(within(dialog).getByRole("button", { name: "Remove pelvis.png" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /Upload Report/ }));
    confirm = await screen.findByRole("dialog", { name: "Confirm Upload" });
    await user.click(within(confirm).getByRole("button", { name: "Confirm Upload" }));

    const done = await screen.findByRole("dialog", { name: "Result uploaded!" });
    await user.click(within(done).getByRole("button", { name: "Done" }));

    // The page now shows the order as completed, with what was written.
    const impression = await screen.findByRole("region", { name: "Impression" });
    expect(impression).toHaveTextContent("A normal pelvic scan.");
    expect(screen.getByText("No free fluid.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download pelvis.png" })).toBeInTheDocument();
    expect(screen.getByText("Dr. Ada Bello", { selector: "dd" })).toBeInTheDocument();
  });
});
