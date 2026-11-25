import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Pending from "@/features/patient/api/pending";
import type { Allergy, CarePlan } from "@/features/patient/api/pending";
import { AllergiesPage } from "@/features/patient/components/allergies-page";
import { AllergyDetails } from "@/features/patient/components/allergy-details";
import { CarePlanDetails } from "@/features/patient/components/care-plan-details";
import { CarePlansPage } from "@/features/patient/components/care-plans-page";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// Allergies and care plans are TODO(api) records: off the mock dev server they're empty, so the
// populated screens are tested with records handed to the pending queries here.
const pending = vi.hoisted(() => ({ allergies: [] as unknown[], carePlans: [] as unknown[] }));

vi.mock("@/features/patient/api/pending", async (importOriginal) => {
  const actual = await importOriginal<typeof Pending>();
  return {
    ...actual,
    allergiesQuery: () => ({
      ...actual.allergiesQuery(),
      queryFn: () => Promise.resolve(pending.allergies as Allergy[]),
    }),
    carePlansQuery: () => ({
      ...actual.carePlansQuery(),
      queryFn: () => Promise.resolve(pending.carePlans as CarePlan[]),
    }),
  };
});

const penicillin: Allergy = {
  id: "allergy-penicillin",
  name: "Penicillin",
  kind: "medicine",
  reaction: "Hives (urticaria)",
  severity: "moderate",
  active: true,
  facility: "ABC Hospital, Ikeja",
  recordedBy: "Dr. Adaeze Okafor",
  at: "2025-03-12T10:00:00Z",
  avoid: "Penicillin and related antibiotics such as amoxicillin and ampicillin.",
  note: "Rash appeared 2 days after starting amoxicillin.",
};
const peanuts: Allergy = {
  ...penicillin,
  id: "allergy-peanuts",
  name: "Peanuts",
  kind: "food",
  reaction: "Swelling, trouble breathing",
  severity: "severe",
  facility: "LUTH",
};

const hypertension: CarePlan = {
  id: "plan-hypertension",
  name: "Hypertension plan",
  status: "active",
  facility: "ABC Hospital",
  setBy: "Dr. Adaeze Okafor",
  startedAt: "2023-03-14T10:00:00Z",
  updatedAt: "2026-10-25T10:00:00Z",
  nextReview: "2026-12-15T10:00:00Z",
  endedAt: null,
  careTeam: "Internal Medicine, ABC Hospital",
  conditionId: "7",
  goal: {
    target: "128/80",
    unit: "mmHg",
    latest: "128/80",
    latestAt: "2026-10-25T10:00:00Z",
    onTrack: true,
  },
  items: [
    { kind: "medication", title: "Amlodipine 10 mg", detail: "Dose increased from 5 mg" },
    { kind: "monitoring", title: "Check blood pressure at home", detail: "Twice a week" },
  ],
};
const malaria: CarePlan = {
  ...hypertension,
  id: "plan-malaria",
  name: "Post-malaria recovery",
  status: "completed",
  facility: "LUTH",
  nextReview: null,
  endedAt: "2026-08-30T10:00:00Z",
  goal: null,
};

beforeEach(() => {
  pending.allergies = [];
  pending.carePlans = [];
  useAuthStore.getState().setSession({
    accessToken: "token",
    accountType: "patient",
    actingAs: [{ as: "self" }],
    user: {
      id: "me",
      name: "Chinonso Okafor",
      email: "c@example.com",
      role: "patient",
      hin: "1234567890123",
    },
  });
});

describe("Allergies", () => {
  it("says none are recorded", async () => {
    renderWithRouter(<AllergiesPage />);
    expect(await screen.findByText("No allergies recorded")).toBeInTheDocument();
    expect(
      screen.getByText("None of your facilities have recorded an allergy for you yet."),
    ).toBeInTheDocument();
  });

  it("lists active allergies, the most severe first", async () => {
    pending.allergies = [penicillin, peanuts];
    renderWithRouter(<AllergiesPage />);
    const list = await screen.findByRole("list", { name: "2 active allergies" });
    const rows = within(list).getAllByRole("link");
    expect(rows[0]).toHaveTextContent("Peanuts");
    expect(rows[0]).toHaveTextContent("Food · swelling, trouble breathing");
    expect(rows[0]).toHaveTextContent("Severe");
    expect(rows[1]).toHaveTextContent("Moderate");
    expect(rows[1]).toHaveAttribute("href", "/patient/health/allergies/allergy-penicillin");
  });

  it("shows what to avoid, the details and the care team's note", async () => {
    pending.allergies = [penicillin];
    renderWithRouter(<AllergyDetails allergyId="allergy-penicillin" />);
    expect(await screen.findByText("Medicine allergy")).toBeInTheDocument();
    expect(screen.getByText("What to avoid")).toBeInTheDocument();
    expect(screen.getByText("Hives (urticaria)")).toBeInTheDocument();
    expect(screen.getByText("Dr. Adaeze Okafor")).toBeInTheDocument();
    expect(
      screen.getByText("Rash appeared 2 days after starting amoxicillin."),
    ).toBeInTheDocument();
  });
});

describe("Care plans", () => {
  it("says there are none yet", async () => {
    renderWithRouter(<CarePlansPage />);
    expect(await screen.findByText("No care plans yet")).toBeInTheDocument();
    expect(
      screen.getByText("Any care plans created by your healthcare team will appear here."),
    ).toBeInTheDocument();
  });

  it("splits running plans from ended ones", async () => {
    pending.carePlans = [hypertension, malaria];
    const { user } = renderWithRouter(<CarePlansPage />);
    expect(await screen.findByText("Hypertension plan")).toBeInTheDocument();
    expect(screen.getByText("ABC Hospital · Review 15 Dec 2026")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Ended (1)" }));
    expect(await screen.findByText("Post-malaria recovery")).toBeInTheDocument();
    expect(screen.getByText("LUTH · Ended 30 Aug 2026")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("shows the goal and what's in the plan", async () => {
    pending.carePlans = [hypertension];
    renderWithRouter(<CarePlanDetails planId="plan-hypertension" />);
    const goal = await screen.findByRole("region", { name: "Your goal" });
    expect(within(goal).getByText("128/80")).toBeInTheDocument();
    expect(within(goal).getByText("Latest 128/80 on 25 Oct")).toBeInTheDocument();
    expect(within(goal).getByText("On track")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Amlodipine 10 mg/ })).toHaveAttribute(
      "href",
      "/patient/health/medications",
    );
    expect(screen.getByText("Check blood pressure at home")).toBeInTheDocument();
    expect(screen.getByText("Internal Medicine, ABC Hospital")).toBeInTheDocument();
  });
});
