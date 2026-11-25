import type { Gender, Power, ProxyGrant } from "@/features/patient/api/family";
import { POWERS } from "@/features/patient/api/family";
import type { GrowthMetric } from "@/features/patient/api/pending-family";
import type { TrendBucket } from "@/features/patient/lib/vitals";
import { ageOn, formatDay, plural } from "@/lib/format";

/** What each power is called where it's asked for, shown and accepted. */
export const powerInfo: Record<
  Power,
  {
    /** In a row's summary: "View, Book, Pay". */
    short: string;
    /** On the review's list and the home page's request: "Message providers". */
    name: string;
    /** On its switch when asking someone: "Message". */
    askName: string;
    /** Under its switch when asking someone. */
    ask: string;
    /** Under its switch on the proxy's access page. */
    detail: string;
  }
> = {
  view: {
    short: "View",
    name: "View records",
    askName: "View records",
    ask: "Results, medications and appointments",
    detail: "See selected parts of your record",
  },
  book: {
    short: "Book",
    name: "Book appointments",
    askName: "Book appointments",
    ask: "Book and change visits for you",
    detail: "Book and manage appointments",
  },
  message: {
    short: "Message",
    name: "Message providers",
    askName: "Message",
    ask: "Message your care teams",
    detail: "Message your care teams",
  },
  pay: {
    short: "Pay",
    name: "Pay bills",
    askName: "Pay bills",
    ask: "Pay hospital bills on your behalf",
    detail: "View and pay bills",
  },
  manage: {
    short: "Manage",
    name: "Manage account",
    askName: "Manage account",
    ask: "Update your account details",
    detail: "Update your account details",
  },
  share: {
    short: "Share",
    name: "Share records",
    askName: "Share records",
    ask: "Share your records with others",
    detail: "Share your records with others",
  },
};

/** The powers "Add a Proxy" offers; the access page offers all of them. */
export const REQUEST_POWERS: Power[] = ["view", "book", "message", "pay"];

/** "View, Book, Pay", in the API's order. */
export function powerSummary(powers: Power[]) {
  return POWERS.filter((power) => powers.includes(power))
    .map((power) => powerInfo[power].short)
    .join(", ");
}

/** How someone can be related to their proxy, as "Add a Proxy" offers it. */
export const PROXY_RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Caregiver",
  "Other",
] as const;

/** How the patient is related to a child they add. */
export const DEPENDANT_RELATIONSHIPS = {
  mother: "Mother",
  father: "Father",
  grandparent: "Grandparent",
  sibling: "Sibling",
  aunt_uncle: "Aunt / Uncle",
  legal_guardian: "Legal guardian",
  other: "Other",
} as const;

export const GENDERS: Partial<Record<Gender, string>> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

const DAY = 24 * 60 * 60 * 1000;
/** A proxy request expires when it's this many days old, unanswered. */
const REQUEST_DAYS = 3;
/**
 * "No end": the API needs a whole number of days (at least 1, no upper limit), so "no end"
 * asks for 100 years. TODO(api): no way to ask for a grant that never ends.
 */
export const NO_END_DAYS = 36_500;

export const DURATIONS = [
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
  { days: NO_END_DAYS, label: "No end" },
];

const addDays = (from: Date, days: number) => new Date(from.getTime() + days * DAY);

/** Grants that still matter: pending (and not yet expired) or accepted (and not yet over). */
export function liveGrants(grants: ProxyGrant[], now = new Date()) {
  return grants.filter((grant) => {
    if (grant.status === "pending") {
      return addDays(new Date(grant.createdAt), REQUEST_DAYS) > now;
    }
    return grant.status === "accepted" && (!grant.endsAt || new Date(grant.endsAt) > now);
  });
}

/** "Spouse · View, Book, Pay". */
export function grantLine(grant: ProxyGrant) {
  return [grant.relationship, powerSummary(grant.powers)].filter(Boolean).join(" · ");
}

/** "Request expires in 3 days" (or "in 1 day", "today"). */
export function requestExpiry(grant: ProxyGrant, now = new Date()) {
  const left = Math.ceil(
    (addDays(new Date(grant.createdAt), REQUEST_DAYS).getTime() - now.getTime()) / DAY,
  );
  return left <= 0 ? "Request expires today" : `Request expires in ${plural(left, "day")}`;
}

/** When the access ends: `ends_at` once accepted, else its length from now; null for "no end". */
function accessEnds(grant: Pick<ProxyGrant, "durationDays" | "endsAt">, now = new Date()) {
  if (grant.durationDays >= NO_END_DAYS) return null;
  return grant.endsAt ? new Date(grant.endsAt) : addDays(now, grant.durationDays);
}

/** "Access until 1 May 2027", or "No end date". */
export function accessLine(grant: Pick<ProxyGrant, "durationDays" | "endsAt">, now = new Date()) {
  const ends = accessEnds(grant, now);
  return ends ? `Access until ${formatDay(ends)}` : "No end date";
}

/** Under the "How long?" chips. */
export function durationHint(days: number, now = new Date()) {
  if (days >= NO_END_DAYS) return "Access lasts until you end it.";
  return `Access ends ${formatDay(addDays(now, days))}. We’ll remind you before then.`;
}

/** "her", "him" or "them". */
export function pronoun(gender: Gender) {
  return gender === "female" ? "her" : gender === "male" ? "him" : "them";
}

/** "6 years", "1 year", or "8 months" for a baby. */
export function ageWords(dob: string, now = new Date()) {
  const birth = new Date(dob);
  const years = ageOn(birth, now);
  if (years >= 1) return plural(years, "year");
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth() -
    (now.getDate() < birth.getDate() ? 1 : 0);
  return plural(Math.max(0, months), "month");
}

/** "Age 6", or "8 months" for a baby. */
export function ageShort(dob: string, now = new Date()) {
  const years = ageOn(new Date(dob), now);
  return years >= 1 ? `Age ${years}` : ageWords(dob, now);
}

/** The page's subtitle: "1 dependent · 1 proxy pending", or "No one added yet". */
export function familySubtitle(dependants: number, proxies: ProxyGrant[]) {
  const pending = proxies.filter((grant) => grant.status === "pending").length;
  const active = proxies.length - pending;
  const parts = [
    dependants ? plural(dependants, "dependent") : null,
    active ? plural(active, "proxy", "proxies") : null,
    pending ? `${plural(pending, "proxy", "proxies")} pending` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No one added yet";
}

/** "50th percentile". */
export function percentileLabel(percentile: number) {
  const tens = percentile % 100;
  const suffix =
    tens >= 11 && tens <= 13
      ? "th"
      : (({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[percentile % 10] ?? "th");
  return `${percentile}${suffix} percentile`;
}

/** A growth measure as the chart's bars: one per year of age. */
export function growthBuckets(metric: GrowthMetric): TrendBucket[] {
  return metric.points.map((point) => ({
    key: String(point.ageYears),
    label: `${point.ageYears}y`,
    longLabel: `Age ${point.ageYears}`,
    values: [point.value],
  }));
}
