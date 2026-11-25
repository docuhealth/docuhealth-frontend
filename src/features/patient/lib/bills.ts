import { z } from "zod";
import type { Bill, Payment, PaymentMethod } from "@/features/patient/api/pending-bills";
import { formatNaira } from "@/features/patient/lib/lab-results";
import { formatDate, formatDayMonth } from "@/lib/format";

/** "ABC Hospital, Ikeja", or just the name when the town isn't known. */
export const facilityLabel = (place: { facility: string; facilityArea: string | null }) =>
  [place.facility, place.facilityArea].filter(Boolean).join(", ");

/** Naira still owed on a bill: what's billed less what the patient and their HMO paid. */
export function outstanding(bill: Bill) {
  return Math.max(0, bill.billed - bill.paidByYou - (bill.hmo?.amount ?? 0));
}

/** Naira owed across every bill. */
export function totalOutstanding(bills: Bill[]) {
  return bills.reduce((sum, bill) => sum + outstanding(bill), 0);
}

/** "₦0.00" for nothing owed (as the card shows it), "₦25,000" otherwise. */
export const formatBalance = (amount: number) => (amount === 0 ? "₦0.00" : formatNaira(amount));

const dueTime = (bill: Bill) => (bill.dueAt ? new Date(bill.dueAt).getTime() : Infinity);

/** One facility the patient owes: how much, by when, and the bill due first. */
export type FacilityOwing = {
  facility: string;
  amount: number;
  dueAt: string | null;
  billId: string;
};

/** What's owed at each facility, the soonest due first. */
export function owingByFacility(bills: Bill[]): FacilityOwing[] {
  const owing = bills
    .filter((bill) => outstanding(bill) > 0)
    .toSorted((a, b) => dueTime(a) - dueTime(b));
  const byFacility = new Map<string, FacilityOwing>();
  for (const bill of owing) {
    const found = byFacility.get(bill.facility);
    if (found) found.amount += outstanding(bill);
    else {
      byFacility.set(bill.facility, {
        facility: bill.facility,
        amount: outstanding(bill),
        dueAt: bill.dueAt,
        billId: bill.id,
      });
    }
  }
  return [...byFacility.values()];
}

/** The page's subtitle: "You're all paid up", or "₦25,000 outstanding · due 25 Oct". */
export function billsSubtitle(total: number, owing: FacilityOwing[]) {
  if (total === 0) return "You’re all paid up";
  const due = owing.find((each) => each.dueAt)?.dueAt;
  return [`${formatNaira(total)} outstanding`, due && `due ${formatDayMonth(new Date(due))}`]
    .filter(Boolean)
    .join(" · ");
}

export type SplitKey = "paid" | "hmo" | "outstanding";
export type SplitPart = { key: SplitKey; label: string; amount: number };

/** How a bill's amount splits: paid by the patient, covered by their HMO, still owed. */
export function billSplit(bill: Bill): SplitPart[] {
  return [
    { key: "paid" as const, label: "Paid by you", amount: bill.paidByYou },
    ...(bill.hmo
      ? [
          {
            key: "hmo" as const,
            label: `HMO contribution · ${bill.hmo.name}`,
            amount: bill.hmo.amount,
          },
        ]
      : []),
    { key: "outstanding" as const, label: "Outstanding", amount: outstanding(bill) },
  ];
}

/**
 * The split as `count` bar ticks, each the part its middle falls in, e.g. 40 ticks of
 * ₦80k / ₦20k / ₦25k → 26 paid, 6 HMO, 8 outstanding.
 */
export function splitTicks(parts: SplitPart[], count: number): SplitKey[] {
  const total = parts.reduce((sum, part) => sum + part.amount, 0);
  if (total <= 0) return [];
  return Array.from({ length: count }, (_, index) => {
    const at = ((index + 0.5) / count) * total;
    let reached = 0;
    for (const part of parts) {
      reached += part.amount;
      if (at < reached) return part.key;
    }
    return parts.at(-1)?.key ?? "paid";
  });
}

const methods: Record<PaymentMethod, string> = {
  card: "Card",
  bank_transfer: "Bank transfer",
  pos: "POS",
};

/** "Card", "Bank transfer", "POS". */
const methodLabel = (method: PaymentMethod) => methods[method];

/** "Card •••• 4021", or the method alone. */
export function methodWithCard(payment: Pick<Payment, "method" | "cardLast4">) {
  return payment.method === "card" && payment.cardLast4
    ? `Card •••• ${payment.cardLast4}`
    : methodLabel(payment.method);
}

/** Newest first. */
export const sortPayments = (payments: Payment[]) =>
  payments.toSorted((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

/** A payment on the Bills page: "Lab tests · 12 Oct 2026". */
export function paymentSummary(payment: Payment) {
  const what = payment.status === "declined" ? "Card declined" : payment.purpose;
  return [what, formatDate(new Date(payment.at))].filter(Boolean).join(" · ");
}

/** A payment in the history: "6 Nov · Card · RCT-77120", "21 Sep · Card declined". */
export function paymentDetail(payment: Payment) {
  const day = formatDayMonth(new Date(payment.at));
  if (payment.status === "declined") return `${day} · ${methodLabel(payment.method)} declined`;
  return [
    day,
    methodLabel(payment.method),
    payment.status === "pending" ? "Awaiting confirmation" : payment.reference,
  ]
    .filter(Boolean)
    .join(" · ");
}

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

/** Payments by month, newest first: [{ label: "November 2026", payments }]. */
export function paymentsByMonth(payments: Payment[]) {
  const groups: { label: string; payments: Payment[] }[] = [];
  for (const payment of sortPayments(payments)) {
    const label = monthYear.format(new Date(payment.at));
    const group = groups.at(-1);
    if (group?.label === label) group.payments.push(payment);
    else groups.push({ label, payments: [payment] });
  }
  return groups;
}

/** The facilities paid, in the order first seen. */
export const paymentFacilities = (payments: Payment[]) => [
  ...new Set(sortPayments(payments).map((payment) => payment.facility)),
];

// The card form. Its values stay in the form and the pay request only: never logged or kept.

/** Digits grouped in fours as typed: "4084084084084081" → "4084 0840 8408 4081". */
export function formatCardNumber(value: string) {
  return (
    value
      .replace(/\D/g, "")
      .slice(0, 19)
      .match(/.{1,4}/g)
      ?.join(" ") ?? ""
  );
}

/** "MM/YY" as typed: "1228" → "12/28", "1" → "1". */
export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** Whether "MM/YY" is a month that's over (a card works to the end of its month). */
export function expiryPassed(expiry: string, now = new Date()) {
  const [month, year] = expiry.split("/").map(Number);
  if (!month || year === undefined) return true;
  return new Date(2000 + year, month, 1) <= now;
}

/** The last four digits of a card number, for "•••• 4021". */
export const lastFour = (number: string) => number.replace(/\D/g, "").slice(-4);

export const cardSchema = z.object({
  number: z
    .string()
    .refine((value) => /^\d{16,19}$/.test(value.replace(/\s/g, "")), "Enter your card number"),
  holder: z
    .string()
    .trim()
    .min(1, "Enter the name on the card")
    .max(100, "Keep the name under 100 characters"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Enter the expiry as MM/YY")
    .refine((value) => !expiryPassed(value), "This card has expired"),
  cvv: z.string().regex(/^\d{3,4}$/, "Enter the 3 or 4 digits on the back"),
});
export type CardForm = z.infer<typeof cardSchema>;
