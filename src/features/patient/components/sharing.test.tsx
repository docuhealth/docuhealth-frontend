import { useMutation } from "@tanstack/react-query";
import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Pending from "@/features/patient/api/pending-sharing";
import type {
  AccessEvent,
  PrivacySettings,
  Share,
  ShareRequest,
  SharingPerson,
} from "@/features/patient/api/pending-sharing";
import { SharingPage } from "@/features/patient/components/sharing-page";
import type { SharingTab } from "@/features/patient/lib/sharing";
import { useAuthStore } from "@/stores/auth-store";
import { pickOption, renderWithRouter } from "@/test/render";

// Sharing is TODO(api) and empty off the mock dev server, so the demo data is handed to the
// pending queries here. Starting and verifying a share are faked (code 123456); stopping a share
// and saving privacy settings aren't, so they fail as they would on staging.
const pending = vi.hoisted(() => ({
  shares: [] as unknown[],
  history: [] as unknown[],
  privacy: { emergencyAccess: false, careTeams: false, research: false } as unknown,
  people: [] as unknown[],
  started: [] as unknown[],
}));

vi.mock("@/features/patient/api/pending-sharing", async (importOriginal) => {
  const actual = await importOriginal<typeof Pending>();
  const fake =
    <T,>(data: () => unknown) =>
    () =>
      Promise.resolve(data() as T);
  return {
    ...actual,
    sharesQuery: () => ({ ...actual.sharesQuery(), queryFn: fake<Share[]>(() => pending.shares) }),
    accessHistoryQuery: () => ({
      ...actual.accessHistoryQuery(),
      queryFn: fake<AccessEvent[]>(() => pending.history),
    }),
    privacySettingsQuery: () => ({
      ...actual.privacySettingsQuery(),
      queryFn: fake<PrivacySettings>(() => pending.privacy),
    }),
    sharingPeopleQuery: () => ({
      ...actual.sharingPeopleQuery(),
      queryFn: fake<SharingPerson[]>(() => pending.people),
    }),
    useStartShare: () =>
      useMutation({
        mutationFn: (share: ShareRequest) => {
          pending.started.push(share);
          return Promise.resolve({ requestId: "req-1", sentTo: "+234 ••• ••• 4821" });
        },
      }),
    useVerifyShare: () =>
      useMutation({
        mutationFn: ({ code }: { requestId: string; code: string }) =>
          code === "123456"
            ? Promise.resolve({
                share: share("new", {
                  recipient: { name: "Dr. John Doe", role: "Cardiologist" },
                  expiresAt: "2026-10-29T10:00:00",
                }),
                accessCode: "7K492Q",
                link: "https://docuhealth.app/shared/7K492Q",
              })
            : Promise.reject(new Error("That code isn’t right")),
      }),
  };
});

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

function share(id: string, fields: Partial<Share>): Share {
  return {
    id,
    recipient: { name: "Dr. Adaeze Okafor", role: "Consultant Physician" },
    facility: { name: "ABC Hospital", area: "Ikeja" },
    items: ["health_summary", "medications"],
    createdAt: daysFromNow(-10),
    expiresAt: daysFromNow(30),
    stoppedAt: null,
    ...fields,
  };
}

const demoShares = [
  share("share-1", {}),
  share("share-2", {
    recipient: { name: "Dr. Kemi Bello", role: null },
    facility: { name: "Reddington Hospital", area: null },
    items: ["lab_results", "allergies"],
    expiresAt: daysFromNow(2),
  }),
];

const demoPeople: SharingPerson[] = [
  {
    id: "doc-doe",
    name: "Dr. John Doe",
    role: "Cardiologist",
    facility: "ABC Hospital",
    facilityArea: "Ikeja",
  },
  {
    id: "doc-okafor",
    name: "Dr. Adaeze Okafor",
    role: "Consultant Physician",
    facility: "ABC Hospital",
    facilityArea: "Ikeja",
  },
];

function renderPage(tab: SharingTab = "share") {
  return renderWithRouter(<SharingPage tab={tab} onTab={() => {}} />);
}

beforeEach(() => {
  pending.shares = [];
  pending.history = [];
  pending.privacy = { emergencyAccess: false, careTeams: false, research: false };
  pending.people = [];
  pending.started = [];
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

describe("Sharing & privacy", () => {
  it("explains sharing and says nothing is shared yet", async () => {
    renderPage();
    expect(await screen.findByText("You’re not sharing your record")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Share your record securely" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share my record" })).toBeInTheDocument();
    const how = screen.getByRole("region", { name: "How it works" });
    expect(how).toHaveTextContent("Choose who and what");
    expect(how).toHaveTextContent("Verify it’s you");
    expect(how).toHaveTextContent("Give them the code");
    expect(screen.getByRole("tab", { name: "Share my record" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("lists active shares and asks before stopping one", async () => {
    pending.shares = [
      ...demoShares,
      share("share-3", {
        recipient: { name: "Dr. Tunde Balogun", role: null },
        stoppedAt: daysFromNow(-3),
      }),
    ];
    const { user } = renderPage();
    const okafor = await screen.findByRole("row", { name: "Dr. Adaeze Okafor" });
    expect(okafor).toHaveTextContent("ABC Hospital, Ikeja");
    expect(okafor).toHaveTextContent("Health summary, Medications");
    expect(okafor).toHaveTextContent("Active");
    const bello = screen.getByRole("row", { name: "Dr. Kemi Bello" });
    expect(bello).toHaveTextContent("Lab results, Allergies");
    expect(bello).toHaveTextContent("Expires soon");
    expect(screen.queryByRole("row", { name: "Dr. Tunde Balogun" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View all" }));
    expect(screen.getByRole("row", { name: "Dr. Tunde Balogun" })).toHaveTextContent("Ended");

    await user.click(
      within(bello).getByRole("button", { name: "Stop sharing with Dr. Kemi Bello" }),
    );
    const confirm = await screen.findByRole("dialog", { name: "Stop sharing?" });
    expect(confirm).toHaveTextContent(
      "Dr. Kemi Bello will no longer see your lab results, allergies.",
    );
    await user.click(within(confirm).getByRole("button", { name: "Stop sharing" }));
    expect(await screen.findByText(/Stopping a share isn’t available yet/)).toBeInTheDocument();
  });

  it("shares a record: who and what, the code, then the access code", async () => {
    pending.people = demoPeople;
    const { user } = renderPage();
    await user.click(await screen.findByRole("button", { name: "Share my record" }));
    const dialog = await screen.findByRole("dialog", { name: "Share my record" });

    await user.click(within(dialog).getByRole("button", { name: "Share record" }));
    expect(await within(dialog).findByText("Choose a facility")).toBeInTheDocument();
    expect(within(dialog).getByText("Choose at least one part of your record")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("combobox", { name: /What facility/ }));
    await pickOption("ABC Hospital");
    await user.type(within(dialog).getByRole("searchbox", { name: "Search people" }), "cardio");
    expect(within(dialog).queryByRole("radio", { name: /Adaeze Okafor/ })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("radio", { name: /Dr. John Doe/ }));
    await user.click(within(dialog).getByRole("checkbox", { name: "Lab results" }));
    await user.click(within(dialog).getByRole("checkbox", { name: "Allergies" }));
    await user.click(within(dialog).getByRole("combobox", { name: /How long/ }));
    await pickOption("7 days");
    await user.click(within(dialog).getByRole("button", { name: "Share record" }));

    const verify = await screen.findByRole("dialog", { name: "Verify account" });
    expect(pending.started).toEqual([
      {
        facility: "ABC Hospital",
        personId: "doc-doe",
        items: ["allergies", "lab_results"],
        duration: "7d",
        reason: null,
      },
    ]);
    expect(verify).toHaveTextContent("Enter the code sent by SMS to +234 ••• ••• 4821");
    expect(within(verify).getByRole("button", { name: /Send again in 1:00/ })).toBeDisabled();

    const code = within(verify).getByRole("textbox", { name: "Verification code" });
    await user.type(code, "111111");
    await user.click(within(verify).getByRole("button", { name: "Verify" }));
    expect(await within(verify).findByText("That code isn’t right")).toBeInTheDocument();

    await user.clear(code);
    await user.type(code, "123456");
    await user.click(within(verify).getByRole("button", { name: "Verify" }));
    const done = await screen.findByRole("dialog", { name: "Record is ready to share" });
    expect(done).toHaveTextContent(
      "Give Dr. John Doe this code or send the secure link. Access expires on 29 October 2026.",
    );
    expect(within(done).getByRole("region", { name: "Access code" })).toHaveTextContent(
      "7K4 - 92Q",
    );
    expect(within(done).getByRole("button", { name: "Copy link" })).toBeInTheDocument();

    await user.click(within(done).getByRole("button", { name: "Stop sharing" }));
    expect(await screen.findByRole("dialog", { name: "Stop sharing?" })).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Record is ready to share" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows who viewed the record, or that no one has", async () => {
    renderPage("history");
    expect(await screen.findByText("No one has viewed your record yet")).toBeInTheDocument();
  });

  it("lists views newest first", async () => {
    pending.history = [
      {
        id: "1",
        viewer: { name: "Dr. Adaeze Okafor", role: null },
        facility: "ABC Hospital",
        item: "health_summary",
        at: daysFromNow(-2),
      },
      {
        id: "2",
        viewer: { name: "Dr. Kemi Bello", role: null },
        facility: "Reddington Hospital",
        item: "lab_results",
        at: daysFromNow(-1),
      },
    ];
    renderPage("history");
    const list = await screen.findByRole("list", { name: "Who viewed your record" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Dr. Kemi Bello viewed Lab results");
    expect(rows[0]).toHaveTextContent("Reddington Hospital");
    expect(rows[1]).toHaveTextContent("Dr. Adaeze Okafor viewed Health summary");
  });

  it("shows the consent switches, and that changing them isn't available yet", async () => {
    pending.privacy = { emergencyAccess: true, careTeams: false, research: false };
    const { user } = renderPage("privacy");
    const emergency = await screen.findByRole("switch", { name: "Allow emergency access" });
    expect(emergency).toBeChecked();
    expect(screen.getByRole("switch", { name: "Use my data for research" })).not.toBeChecked();
    await user.click(
      screen.getByRole("switch", { name: "Share with my care teams automatically" }),
    );
    expect(
      await screen.findByText(/Changing privacy settings isn’t available yet/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Share with my care teams automatically" }),
    ).not.toBeChecked();
  });
});
