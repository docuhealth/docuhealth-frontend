import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { AdmissionCharts } from "@/features/clinical/components/admission-charts";
import { TaskQueue } from "@/features/nurse/components/task-queue";
import { server } from "@/mocks/node";
import { pickOption, renderWithRouter } from "@/test/render";

// Yemi Ojo's admission (admission-1) has three tasks in the care task mock: vital signs (blood
// pressure, temperature, heart rate; overdue), paracetamol, and a strict fluid balance. The
// tests go in order: each claims and finishes one.

/** The table row for the task called `task` (found even while a dialog is open). */
async function rowOf(task: string) {
  const table = await screen.findByRole("table", { hidden: true });
  return (await within(table).findByText(task)).closest("tr")!;
}

async function claim(user: UserEvent, task: string) {
  await user.click(within(await rowOf(task)).getByRole("button", { name: /Claim/ }));
  expect(await screen.findByText(`Yemi Ojo’s ${task.toLowerCase()} is yours.`)).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: /In progress/ }));
}

describe("TaskQueue", () => {
  it("claims a vitals task and records just the readings asked for, which then chart", async () => {
    const { user } = renderWithRouter(
      <>
        <TaskQueue admissionId="admission-1" />
        <AdmissionCharts admissionId="admission-1" />
      </>,
    );
    const vitals = await rowOf("Vital signs");
    expect(within(vitals).getByText("Blood pressure, Temperature, Heart rate")).toBeInTheDocument();
    expect(within(vitals).getByText("Overdue")).toBeInTheDocument();

    await claim(user, "Vital signs");
    await user.click(within(await rowOf("Vital signs")).getByRole("button", { name: /Record/ }));
    const dialog = await screen.findByRole("dialog", { name: "Record vital signs" });
    // Only what the doctor asked for.
    expect(within(dialog).queryByLabelText(/SpO₂/)).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Record" }));
    expect(await within(dialog).findAllByText("Enter this reading")).toHaveLength(3);

    await user.type(within(dialog).getByLabelText(/Blood pressure/), "150/95");
    await user.type(within(dialog).getByLabelText(/Temperature/), "37.2");
    await user.type(within(dialog).getByLabelText(/Heart rate/), "88");
    await user.click(within(dialog).getByRole("button", { name: "Record" }));
    expect(await screen.findByText("Yemi Ojo’s vital signs are recorded.")).toBeInTheDocument();

    const chart = screen.getByRole("region", { name: "Chart" });
    expect(await within(chart).findByText(/150\/95/)).toBeInTheDocument();
  });

  it("confirms a medication given", async () => {
    const { user } = renderWithRouter(<TaskQueue admissionId="admission-1" />);
    const medication = await rowOf("Medication");
    expect(
      within(medication).getByText(/Paracetamol · 1 g · Three times daily/),
    ).toBeInTheDocument();
    await claim(user, "Medication");
    await user.click(
      within(await rowOf("Medication")).getByRole("button", { name: /Confirm .* given/ }),
    );
    expect(
      await screen.findByText("Yemi Ojo’s medication is recorded as given."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /Done/ }));
    expect(within(await rowOf("Medication")).getByText("Done")).toBeInTheDocument();
  });

  it("records fluid intake alone, which shows in today's balance", async () => {
    const { user } = renderWithRouter(
      <>
        <TaskQueue admissionId="admission-1" />
        <AdmissionCharts admissionId="admission-1" />
      </>,
    );
    await claim(user, "Fluid intake and output");
    await user.click(
      within(await rowOf("Fluid intake and output")).getByRole("button", { name: /Record/ }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Record fluid intake and output" });
    // The intake's box comes first; nothing came out this time.
    await user.click(within(dialog).getAllByRole("checkbox", { name: "Nothing to record" })[1]!);

    await user.click(within(dialog).getByRole("combobox", { name: /Source/ }));
    await pickOption("Oral fluids");
    await user.click(within(dialog).getByRole("combobox", { name: /^Fluid/ }));
    await pickOption("Water");
    await user.click(within(dialog).getByRole("combobox", { name: /Route/ }));
    await pickOption("Oral");
    await user.type(within(dialog).getByLabelText(/Volume/), "250");
    await user.click(within(dialog).getByRole("button", { name: "Record" }));
    expect(
      await screen.findByText("Yemi Ojo’s fluid intake and output is recorded."),
    ).toBeInTheDocument();
    const balance = await screen.findByRole("region", { name: "Today’s fluid balance" });
    expect(within(balance).getByText("+250 ml")).toBeInTheDocument();
  });
});

describe("TaskQueue with staging's rows", () => {
  it("reads the task list exactly as staging sends it", async () => {
    const row = (sqid: string, type: string, summary: unknown, status = "pending") => ({
      sqid,
      patient_info: {
        hin: "9966898374833",
        firstname: "Tiwa",
        lastname: "Lade",
        gender: "male",
        dob: "2026-01-08",
      },
      task_type: type,
      instructions: "This is testing",
      priority: "high",
      scheduled_for: "2026-09-12T21:00:00Z",
      timing_state: "overdue",
      status,
      summary,
    });
    server.use(
      http.get(`${env.VITE_API_URL}/api/inpatients/task-occurrences`, ({ request }) => {
        const status = new URL(request.url).searchParams.get("status");
        const results =
          status === "pending"
            ? [
                row("meHdPLa", "vital_signs", {
                  parameters: [
                    "blood_pressure",
                    "temp",
                    "resp_rate",
                    "height",
                    "weight",
                    "heart_rate",
                    "spo2",
                    "pain_score",
                  ],
                }),
                row("sFt3U7d", "medication", {
                  drug_name: "PEDIA-LAX (Oral Film)",
                  quantity: 2,
                  unit: "mg",
                  frequency: "bd",
                }),
                row("1ZNTvDK", "nurse_in_patient_discharge", null),
              ]
            : [];
        return HttpResponse.json({ count: results.length, next: null, previous: null, results });
      }),
    );
    renderWithRouter(<TaskQueue />);
    const medication = await rowOf("Medication");
    expect(
      within(medication).getByText("PEDIA-LAX (Oral Film) · 2 mg · Twice daily"),
    ).toBeInTheDocument();
    expect(within(medication).getByText("Tiwa Lade")).toBeInTheDocument();
    expect(within(medication).getByText("Overdue")).toBeInTheDocument();
    expect(
      within(await rowOf("Vital signs")).getByText(/Blood pressure, Temperature/),
    ).toBeInTheDocument();
    expect(await rowOf("Discharge checklist")).toBeInTheDocument();
  });
});
