import type {
  AccessEvent,
  RecordPart,
  Share,
  ShareDuration,
  ShareReason,
  SharingPerson,
} from "@/features/patient/api/pending-sharing";

// The Sharing & privacy screens: what each share is called, whether it still runs, and who the
// patient can pick. TODO(api): the shares themselves come from api/pending-sharing.ts.

/** The page's tabs: Share my record, Access history, Privacy & consent. */
export const sharingTabs = ["share", "history", "privacy"] as const;
export type SharingTab = (typeof sharingTabs)[number];

/** The "What do you want to share?" chips, in the design's order. */
export const recordPartLabels: Record<RecordPart, string> = {
  allergies: "Allergies",
  immunizations: "Immunizations",
  radiology: "Radiology reports",
  lab_results: "Lab results",
  visit_summaries: "Visit summaries",
  documents: "Documents",
  medications: "Current medications",
  health_summary: "Health summary",
};

/** Shorter names for the list of what a share holds: "Health summary, Medications". */
const shortLabels: Partial<Record<RecordPart, string>> = { medications: "Medications" };

export const durationLabels: Record<ShareDuration, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export const reasonLabels: Record<ShareReason, string> = {
  second_opinion: "Second opinion",
  referral: "Referral",
  insurance: "Insurance",
  personal: "Personal",
  other: "Other",
};

/** "Health summary, Medications". */
export function sharedItems(items: RecordPart[]) {
  return items.map((item) => shortLabels[item] ?? recordPartLabels[item]).join(", ");
}

/** A share ends "soon" within this long of its expiry. */
const SOON_MS = 3 * 86_400_000;

export type ShareStatus = "active" | "expiring" | "ended";

/** Running, running but ending within 3 days, or stopped / expired. */
export function shareStatus(share: Share, now = new Date()): ShareStatus {
  if (share.stoppedAt) return "ended";
  const left = new Date(share.expiresAt).getTime() - now.getTime();
  if (left <= 0) return "ended";
  return left <= SOON_MS ? "expiring" : "active";
}

/** The shares that still run, ending soonest first, and the ended ones, latest first. */
export function sortShares(shares: Share[], now = new Date()) {
  const running = shares
    .filter((share) => shareStatus(share, now) !== "ended")
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
  const ended = shares
    .filter((share) => shareStatus(share, now) === "ended")
    .sort((a, b) => (b.stoppedAt ?? b.expiresAt).localeCompare(a.stoppedAt ?? a.expiresAt));
  return { running, ended };
}

/** "ABC Hospital, Ikeja". */
export function facilityLabel(facility: { name: string; area: string | null }) {
  return [facility.name, facility.area].filter(Boolean).join(", ");
}

/** Facilities to share with: the patient's own first, then any others with people to pick. */
export function sharingFacilities(own: string[], people: SharingPerson[]) {
  return [...new Set([...own, ...people.map((person) => person.facility)])];
}

/** The people at `facility` whose name or role matches `search`. */
export function peopleAt(people: SharingPerson[], facility: string, search: string) {
  const query = search.trim().toLowerCase();
  return people.filter(
    (person) =>
      person.facility === facility &&
      (!query ||
        person.name.toLowerCase().includes(query) ||
        (person.role ?? "").toLowerCase().includes(query)),
  );
}

/** "7K492Q" → "7K4 - 92Q", as the success panel shows it. */
export function formatAccessCode(code: string) {
  return code.length === 6 ? `${code.slice(0, 3)} - ${code.slice(3)}` : code;
}

const longDay = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "29 October 2026". */
export function formatExpiry(at: string) {
  return longDay.format(new Date(at));
}

/** "Dr. Kemi Bello viewed Lab results". */
export function accessEventTitle(event: AccessEvent) {
  return `${event.viewer.name} viewed ${recordPartLabels[event.item]}`;
}

/** How many digits the one-time code has. */
export const SHARE_CODE_LENGTH = 6;
