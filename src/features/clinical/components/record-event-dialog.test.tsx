import { screen, within } from "@testing-library/react";
import { HttpResponse, http, type JsonBodyType } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { VisitRecords } from "@/features/clinical/components/visit-records";
import { server } from "@/mocks/node";
import { renderWithProviders } from "@/test/render";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

/** A visit whose timeline has one event of `type`, whose details are `details`. */
function oneEvent(type: string, details: JsonBodyType, status = 200) {
  server.use(
    http.get(api("/api/records/admissions/:sqid/records"), () =>
      HttpResponse.json({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            sqid: "event-1",
            record_type: type,
            action: "created",
            created_at: new Date().toISOString(),
            staff_info: {
              sqid: "staff-1",
              firstname: "Raphael",
              lastname: "Jonnas",
              role: "doctor",
            },
            record: null,
          },
        ],
      }),
    ),
    http.get(api("/api/records/events/event-1"), () => HttpResponse.json(details, { status })),
  );
}

async function open(title: string) {
  const { user } = renderWithProviders(
    <VisitRecords visit={{ id: "admission-1", kind: "admission" }} />,
  );
  await user.click(await screen.findByRole("button", { name: new RegExp(title) }));
  return screen.findByRole("dialog");
}

describe("a timeline record's details", () => {
  it("shows vital signs as readings", async () => {
    const dialog = await open("Vital signs");
    expect(within(dialog).getByRole("heading", { name: "Vital signs", level: 2 })).toBeVisible();
    const row = (await within(dialog).findByText("Blood pressure")).closest("div")!;
    expect(within(row).getByText("120/80")).toBeInTheDocument();
    expect(within(dialog).getByText("36.8 °C")).toBeInTheDocument();
    expect(within(dialog).getByText("72 bpm")).toBeInTheDocument();
    expect(within(dialog).getByText("Comfortable, no distress.")).toBeInTheDocument();
  });

  it("shows a record of a type it doesn't know as the fields sent", async () => {
    const dialog = await open("Progress note");
    const row = (await within(dialog).findByText("Plan")).closest("div")!;
    expect(within(row).getByText("Continue antibiotics; review tomorrow.")).toBeInTheDocument();
    expect(within(dialog).getByText("Feels better this morning.")).toBeInTheDocument();
  });

  it("shows a lab order's tests and values", async () => {
    oneEvent("lab_test_order", {
      sqid: "order-1",
      ordered_by_info: { firstname: "Raphael", lastname: "Jonnas", role: "doctor" },
      created_at: "2026-11-20T09:00:00Z",
      note: "Fasting sample.",
      items_info: [
        {
          sqid: "item-1",
          test_info: { name: "Full blood count", category: { name: "Haematology" } },
          status: "result_ready",
          specimen_collected_at: "2026-11-20T10:00:00Z",
          result_info: {
            parameters_info: [
              {
                value: "13.2",
                parameter_info: { name: "Haemoglobin", unit: "g/dL", ref_low: 12, ref_high: 16 },
              },
            ],
          },
        },
        { sqid: "item-2", test_info: "not an object", status: 7 },
      ],
    });
    const dialog = await open("Lab test order");
    const test = await within(dialog).findByRole("region", { name: "Full blood count" });
    expect(within(test).getByText("Result ready")).toBeInTheDocument();
    expect(within(test).getByText("13.2 g/dL (ref 12–16)")).toBeInTheDocument();
    expect(within(dialog).getByText("Dr. Raphael Jonnas")).toBeInTheDocument();
    expect(within(dialog).getByText("Fasting sample.")).toBeInTheDocument();
    // A test it can't read is still listed, without crashing the order.
    expect(within(dialog).getByRole("region", { name: "Test" })).toHaveTextContent(
      "No result yet.",
    );
  });

  it("falls back to the fields sent when a known type doesn't read as one", async () => {
    oneEvent("vital_signs", { blood_pressure: "110/70", weird: { name: "Odd thing" } });
    const dialog = await open("Vital signs");
    const row = (await within(dialog).findByText("Weird")).closest("div")!;
    expect(within(row).getByText("Odd thing")).toBeInTheDocument();
    expect(within(dialog).getByText("110/70")).toBeInTheDocument();
  });

  it("shows the API's message when the record can't be loaded", async () => {
    oneEvent("mystery_record", { detail: "This record was removed." }, 404);
    const dialog = await open("Mystery record");
    expect(await within(dialog).findByText("This record was removed.")).toBeInTheDocument();
    expect(within(dialog).getByText("We couldn’t load this record.")).toBeInTheDocument();
  });
});
