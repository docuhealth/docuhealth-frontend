import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as PendingFamily from "@/features/patient/api/pending-family";
import type { DependantExtras } from "@/features/patient/api/pending-family";
import { DependantDetails } from "@/features/patient/components/dependant-details";
import { FamilyPage } from "@/features/patient/components/family-page";
import { PatientHome } from "@/features/patient/components/patient-home";
import { ProxyAccessPage } from "@/features/patient/components/proxy-access-page";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { resetFamilyMocks } from "@/mocks/patient-family";
import { useAuthStore } from "@/stores/auth-store";
import { pickOption, renderWithRouter } from "@/test/render";

// The demo family (src/mocks/patient-family.ts): Damilola Adeyemi (6) as a dependant, no proxies,
// and a pending request from Grace Adeyemi. HIN 123-456-789-01 finds no one; any other HIN finds
// Folake Adeyemi. Photos, due vaccines and growth are TODO(api) pending data, empty off the mock
// dev server, so they're handed to the pending query here.

const navigate = vi.fn();
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useNavigate: () => navigate,
}));

const damilola: DependantExtras = {
  hin: "55120934",
  photoUrl: null,
  vaccinesDue: [{ name: "MMR booster", dueBy: "2026-12-30", where: "Any DocuHealth clinic" }],
  growth: {
    weight: {
      unit: "kg",
      percentile: 50,
      points: [
        { ageYears: 5, value: 18.2 },
        { ageYears: 6, value: 20.4 },
      ],
    },
    height: { unit: "cm", percentile: 55, points: [{ ageYears: 6, value: 116 }] },
    bmi: { unit: "kg/m²", percentile: null, points: [] },
  },
};

vi.mock("@/features/patient/api/pending-family", async (importOriginal) => {
  const actual = await importOriginal<typeof PendingFamily>();
  return {
    ...actual,
    dependantExtrasQuery: () => ({
      ...actual.dependantExtrasQuery(),
      queryFn: () => Promise.resolve([damilola]),
    }),
  };
});

const api = (path: string) => `${env.VITE_API_URL}${path}`;
const page = (results: unknown[]) =>
  HttpResponse.json({ count: results.length, next: null, previous: null, results });

beforeEach(() => {
  resetFamilyMocks();
  navigate.mockClear();
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

describe("Family & proxy", () => {
  it("lists dependants, an empty proxies card and people the patient helps", async () => {
    renderWithRouter(<FamilyPage />);
    const dependants = await screen.findByRole("list", { name: "Dependents" });
    expect(within(dependants).getByRole("link", { name: /Damilola Adeyemi/ })).toHaveAttribute(
      "href",
      "/patient/family/dependants/55120934",
    );
    expect(dependants).toHaveTextContent("Age 6 · HIN 55120934");
    expect(within(dependants).getByText("1 vaccine due")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add someone you trust/ })).toBeInTheDocument();
    const helping = screen.getByRole("list", { name: "People you help" });
    expect(helping).toHaveTextContent("Grace Adeyemi");
    expect(helping).toHaveTextContent("Mother · View, Book, Message");
    expect(within(helping).getByText("Request")).toBeInTheDocument();
  });

  it("shows the empty state when no one is added", async () => {
    server.use(
      http.get(api("/api/patients/dependants"), () => page([])),
      http.get(api("/api/patients/proxies"), () => page([])),
      http.get(api("/api/patients/proxies/held"), () => page([])),
    );
    renderWithRouter(<FamilyPage />);
    expect(await screen.findByText("No one added yet")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Add a proxy/ })).toHaveLength(2);
  });

  it("adds a dependant and shows their new HIN", async () => {
    const { user } = renderWithRouter(<FamilyPage />);
    await screen.findByRole("list", { name: "Dependents" });
    await user.click(screen.getByRole("button", { name: /Add a dependent/ }));
    const dialog = await screen.findByRole("dialog", { name: "Add a Dependent" });
    await user.click(within(dialog).getByRole("button", { name: /Add a Child/ }));
    expect(await within(dialog).findByText("Enter the child’s first name")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/First Name/), "Tobi");
    await user.type(within(dialog).getByLabelText(/Last Name/), "Adeyemi");
    await user.type(within(dialog).getByLabelText(/Date of Birth/), "14032024");
    await user.click(within(dialog).getByRole("combobox", { name: /Gender/ }));
    await pickOption("Male");
    await user.click(within(dialog).getByRole("combobox", { name: /Relationship to child/ }));
    await pickOption("Father");
    await user.click(within(dialog).getByRole("button", { name: /Add a Child/ }));

    const done = await screen.findByRole("dialog", { name: "Dependent registered!" });
    expect(done).toHaveTextContent("Tobi Adeyemi is linked to your account.");
    expect(done).toHaveTextContent(/Child’s HIN: \d+/);
    await user.click(within(done).getByRole("button", { name: "Done" }));
    expect(await screen.findByRole("link", { name: /Tobi Adeyemi/ })).toBeInTheDocument();
  });

  it("says when no one has the HIN, then sends a proxy request", async () => {
    const { user } = renderWithRouter(<FamilyPage />);
    await screen.findByRole("list", { name: "Dependents" });
    await user.click(screen.getByRole("button", { name: /^Add a proxy/ }));
    let dialog = await screen.findByRole("dialog", { name: "Add a Proxy" });
    await user.type(within(dialog).getByLabelText(/Enter HIN/), "12345678901");
    expect(within(dialog).getByLabelText(/Enter HIN/)).toHaveValue("123-456-789-01");
    await user.click(within(dialog).getByRole("radio", { name: "Spouse" }));
    await user.click(within(dialog).getByRole("button", { name: /Continue/ }));

    dialog = await screen.findByRole("dialog", { name: "What can they do?" });
    expect(dialog).toHaveTextContent("We’ll remind you before then.");
    await user.click(within(dialog).getByRole("button", { name: /Send Request/ }));

    dialog = await screen.findByRole("dialog", { name: "Add a Proxy" });
    expect(
      await within(dialog).findByText("No account found for this HIN. Check it and try again."),
    ).toBeInTheDocument();
    const hin = within(dialog).getByLabelText(/Enter HIN/);
    await user.clear(hin);
    await user.type(hin, "98765432109");
    await user.click(within(dialog).getByRole("button", { name: /Continue/ }));
    dialog = await screen.findByRole("dialog", { name: "What can they do?" });
    await user.click(within(dialog).getByRole("switch", { name: /Pay bills/ }));
    await user.click(within(dialog).getByRole("button", { name: /Send Request/ }));

    const sent = await screen.findByRole("dialog", { name: "Request sent!" });
    expect(sent).toHaveTextContent("We’ve asked Folake to confirm.");
    await user.click(within(sent).getByRole("button", { name: "Done" }));
    const proxies = await screen.findByRole("list", { name: "Proxies" });
    expect(proxies).toHaveTextContent("Folake Adeyemi");
    expect(proxies).toHaveTextContent("Spouse · View, Book, Pay");
    expect(within(proxies).getByText("Pending")).toBeInTheDocument();
  });

  it("accepts a request to be someone's proxy", async () => {
    const { user } = renderWithRouter(<FamilyPage />);
    const helping = await screen.findByRole("list", { name: "People you help" });
    await user.click(within(helping).getByRole("button", { name: /Grace Adeyemi/ }));
    const dialog = await screen.findByRole("dialog", {
      name: "Grace Adeyemi wants to add you as her proxy",
    });
    expect(dialog).toHaveTextContent("Message providers");
    expect(dialog).toHaveTextContent("Only accept if you know and trust this person.");
    await user.click(within(dialog).getByRole("button", { name: "Accept" }));
    expect(await screen.findByText("You’re now Grace’s proxy")).toBeInTheDocument();
    await vi.waitFor(() =>
      expect(
        within(screen.getByRole("list", { name: "People you help" })).queryByText("Request"),
      ).not.toBeInTheDocument(),
    );
  });
});

describe("Proxy access", () => {
  const folake = {
    hin: "98765432109",
    firstname: "Folake",
    lastname: "Adeyemi",
    gender: "female",
    dob: "1990-02-14",
  };
  const grant = {
    sqid: "grant-folake",
    patient_info: folake,
    proxy_info: folake,
    granted_by_info: folake,
    relationship: "Spouse",
    powers: ["view", "book", "pay"],
    duration_days: 365,
    status: "accepted",
    created_at: "2026-01-02T10:00:00Z",
    accepted_at: "2026-01-02T12:00:00Z",
    ends_at: "2027-01-02T12:00:00Z",
  };

  it("shows what the proxy can do, and removes their access", async () => {
    server.use(
      http.get(api("/api/patients/proxies"), () => page([grant])),
      http.post(api("/api/patients/proxies/grant-folake/end"), () =>
        HttpResponse.json({ ...grant, status: "ended" }),
      ),
    );
    const { user } = renderWithRouter(<ProxyAccessPage proxyId="grant-folake" />);
    expect(await screen.findByText("What can Folake do?")).toBeInTheDocument();
    expect(screen.getByText("Spouse · Added 2 Jan 2026")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /^View/ })).toBeChecked();
    expect(screen.getByRole("switch", { name: /Message/ })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();

    // TODO(api): powers can't be changed yet.
    await user.click(screen.getByRole("switch", { name: /Message/ }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(
      await screen.findByText(/Changing a proxy’s access isn’t available yet/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove access" }));
    const confirm = await screen.findByRole("dialog", { name: "Remove Folake’s access?" });
    await user.click(within(confirm).getByRole("button", { name: "Remove access" }));
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: "/patient/family" }));
  });
});

describe("Dependant details", () => {
  it("shows the vaccine due and growth by age", async () => {
    const { user } = renderWithRouter(<DependantDetails hin="55120934" />);
    expect(await screen.findByText("MMR booster due")).toBeInTheDocument();
    expect(screen.getByText("Due by 30 Dec 2026 · Any DocuHealth clinic")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Book vaccination" })).toBeInTheDocument();
    expect(screen.getByText("50th percentile")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("Age 6");

    await user.click(screen.getByRole("tab", { name: "BMI" }));
    expect(screen.getByText("No BMI readings yet.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Damilola Adeyemi’s details/ }));
    const details = await screen.findByRole("dialog", { name: "Damilola Adeyemi" });
    expect(details).toHaveTextContent("55120934");
  });

  it("says when the dependant isn't linked", async () => {
    renderWithRouter(<DependantDetails hin="000" />);
    expect(await screen.findByText("Dependent not found")).toBeInTheDocument();
  });
});

describe("Patient home, with a proxy request", () => {
  it("puts the request first in Needs Your Attention", async () => {
    renderWithRouter(<PatientHome />);
    const tab = await screen.findByRole("tab", { name: /Proxy request/ });
    expect(tab).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", {
      name: "Grace Adeyemi wants to add you as a proxy",
    });
    expect(panel).toHaveTextContent("Mother · Request expires in 3 days");
    expect(panel).toHaveTextContent("Book appointments");
    expect(within(panel).getByRole("button", { name: /Review request/ })).toBeInTheDocument();
    // The other tabs are still there.
    expect(await screen.findByRole("tab", { name: /Recent Results/ })).toBeInTheDocument();
  });
});
