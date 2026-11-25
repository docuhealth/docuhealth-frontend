import { screen, waitFor, within } from "@testing-library/react";
import { http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { PatientManagement } from "@/features/hospital-admin/components/patient-management";
import { PatientProfile } from "@/features/hospital-admin/components/patient-profile";
import { server } from "@/mocks/node";
import { pickOption, renderWithRouter } from "@/test/render";
import type { PatientTab } from "@/features/hospital-admin/api/schemas";

const renderTab = (tab: PatientTab) =>
  renderWithRouter(
    <PatientManagement period="month" onPeriodChange={() => {}} tab={tab} onTabChange={() => {}} />,
  );

/** The stat card labelled `label`. */
async function card(label: string) {
  return (await screen.findByText(label)).closest("div")!;
}

describe("PatientManagement", () => {
  it("shows the period's check-in numbers and their change on the period before", async () => {
    renderTab("admitted");
    expect(await card("Total check-in")).toHaveTextContent("1,284");
    const fresh = await card("New check-ins");
    expect(fresh).toHaveTextContent("120");
    expect(fresh).toHaveTextContent("−8 vs last month");
    const thisMonth = await card("Check-ins this month");
    expect(thisMonth).toHaveTextContent("412");
    expect(thisMonth).toHaveTextContent("+37 vs last month");
    expect(await card("Returning Patients")).toHaveTextContent("236");
  });

  it("lists admitted patients with their ward, bed and doctor", async () => {
    renderTab("admitted");
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Yemi Ojo")).closest("tr")!;
    expect(within(row).getByText("General ward")).toBeInTheDocument();
    expect(within(row).getByText("Bed 1")).toBeInTheDocument();
    expect(within(row).getByText("Dr. Raphael Jonnas")).toBeInTheDocument();
  });

  it("lists checked-out patients, with a dash for the visit length the API can't give", async () => {
    renderTab("checked_out");
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("Hauwa Garba")).closest("tr")!;
    expect(within(row).getByText("Dr. Sarah Adeyemi")).toBeInTheDocument();
    expect(within(row).getByText("—")).toBeInTheDocument();
  });

  it("asks the API for the date filter's period", async () => {
    const periods: (string | null)[] = [];
    server.use(
      http.get(`${env.VITE_API_URL}/api/hospital-ops/patients`, ({ request }) => {
        const params = new URL(request.url).searchParams;
        if (params.get("status") === "outpatient_discharge" && params.get("size") !== "1") {
          periods.push(params.get("period"));
        }
        // Then on to the mock's own answer.
        return undefined;
      }),
    );
    const { user } = renderTab("checked_out");
    const table = await screen.findByRole("table");
    await within(table).findByText("Hauwa Garba");
    expect(periods).toEqual([null]);

    await user.click(screen.getByRole("combobox", { name: "Check-Out date" }));
    await pickOption("This Week");
    await waitFor(() => expect(periods).toContain("week"));
  });

  it("says filtering by ward isn't available yet", async () => {
    const { user } = renderTab("admitted");
    const table = await screen.findByRole("table");
    await within(table).findByText("Yemi Ojo");
    await user.click(screen.getByRole("combobox", { name: "Ward" }));
    await pickOption("ICU ward");
    expect(
      await within(table).findByText(
        "Filtering patients by ward isn’t available yet. It’s waiting on the backend.",
      ),
    ).toBeInTheDocument();
  });
});

describe("PatientProfile", () => {
  it("shows the patient's record, visits at this hospital and dependants", async () => {
    renderWithRouter(<PatientProfile patientId="5413700000000" />);
    expect(await screen.findByRole("heading", { name: "Yemi Ojo" })).toBeInTheDocument();
    expect(screen.getByText("HMO Patient")).toBeInTheDocument();
    expect(screen.getByText("24 Allen Avenue, Ikeja, Lagos, Nigeria")).toBeInTheDocument();

    // A check-in and a completed appointment; the booked and cancelled ones don't count.
    expect(await card("Total visits")).toHaveTextContent("2");
    expect(await card("Upcoming Appointment")).not.toHaveTextContent("N/A");

    const visits = screen.getByRole("list", { name: "Visits" });
    expect(within(visits).getAllByRole("listitem")).toHaveLength(4);
    expect(within(visits).getByText("Appointment · Follow-Up · Upcoming")).toBeInTheDocument();
    expect(within(visits).getByText("Appointment · Cancelled")).toBeInTheDocument();
    expect(within(visits).getAllByText("Check-In")).toHaveLength(1);

    const dependants = screen.getByRole("list", { name: "Dependants" });
    expect(within(dependants).getByRole("link", { name: "Tobi Ojo" })).toBeInTheDocument();
  });

  it("lists a dependant's guardians", async () => {
    renderWithRouter(<PatientProfile patientId="7894623012343" />);
    expect(await screen.findByRole("heading", { name: "Tobi Ojo" })).toBeInTheDocument();
    const guardians = screen.getByRole("list", { name: "Guardians" });
    expect(within(guardians).getByRole("link", { name: "Yemi Ojo" })).toBeInTheDocument();
  });
});
