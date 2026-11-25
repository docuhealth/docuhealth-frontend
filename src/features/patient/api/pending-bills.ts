import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";
import { totalOutstanding } from "@/features/patient/lib/bills";

// TODO(api): the patient's bills and payments. The API has no patient billing yet: `/api/payments/*`
// are facilities' DocuHealth subscriptions, and `/api/patients/{hin}/payment-category` is the
// facility's own record of how a patient pays (cash, HMO). Patients can't see their invoices,
// what was charged, what their HMO covered, what they paid, or pay a bill.
// On the mock dev server (`npm run dev`) all of this comes from src/mocks/patient-bills.ts and
// paying works there; on staging and live the lists are empty and paying fails with "… isn't
// available yet". When the endpoints land, point these at the real paths.

const PENDING = "/api/pending/patient/bills";

const mocked = () => import.meta.env.DEV && env.VITE_ENABLE_MOCKS;

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!mocked()) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

/** An action on the mock server in dev; everywhere else it fails, saying `what` can't be done yet. */
function pendingAction<T extends z.ZodType>(schema: T, what: string, path: string, data: unknown) {
  if (!mocked()) return Promise.reject(new NotAvailableYetError(what));
  return request(schema, { method: "POST", url: `${PENDING}${path}`, data });
}

const billKeys = {
  all: ["patient", "pending", "bills"] as const,
};

const serviceSchema = z.object({
  name: z.string(),
  department: z.string().nullable(),
  /** Naira. */
  amount: z.number(),
});
export type BillService = z.output<typeof serviceSchema>;

const billSchema = z.object({
  id: z.string(),
  facility: z.string(),
  /** The town, e.g. "Ikeja": "ABC Hospital, Ikeja". */
  facilityArea: z.string().nullable(),
  /** "DB-20931". */
  invoice: z.string(),
  issuedAt: z.string(),
  dueAt: z.string().nullable(),
  services: z.array(serviceSchema),
  /** Naira: everything charged. */
  billed: z.number(),
  /** Naira the patient has paid so far. */
  paidByYou: z.number(),
  /** What the patient's HMO covered. */
  hmo: z.object({ name: z.string(), amount: z.number() }).nullable(),
  /** The facility's account, for paying by bank transfer. */
  payTo: z
    .object({ bank: z.string(), accountName: z.string(), accountNumber: z.string() })
    .nullable(),
});
export type Bill = z.output<typeof billSchema>;

const paymentMethodSchema = z.enum(["card", "bank_transfer", "pos"]);
export type PaymentMethod = z.output<typeof paymentMethodSchema>;

const paymentSchema = z.object({
  id: z.string(),
  billId: z.string().nullable(),
  facility: z.string(),
  facilityArea: z.string().nullable(),
  at: z.string(),
  /** Naira. */
  amount: z.number(),
  method: paymentMethodSchema,
  /** `pending`: a transfer or POS payment the facility hasn't confirmed yet. */
  status: z.enum(["paid", "declined", "pending"]),
  /** The receipt's number, "RCT-77120"; none for a declined payment. */
  reference: z.string().nullable(),
  /** What it paid for: "Lab tests", "Part payment". */
  purpose: z.string().nullable(),
  /** A card payment's last four digits, for "Card •••• 4021". */
  cardLast4: z.string().nullable(),
});
export type Payment = z.output<typeof paymentSchema>;

const billingSchema = z.object({
  bills: z.array(billSchema),
  payments: z.array(paymentSchema),
});
export type Billing = z.output<typeof billingSchema>;

/** Every bill the patient has had, and every payment they made. */
export const billingQuery = () =>
  queryOptions({
    queryKey: billKeys.all,
    queryFn: () => pendingRequest(billingSchema, "", { bills: [], payments: [] }),
  });

/**
 * Naira the patient owes across all facilities (`undefined` while it loads), e.g. for Home's
 * "Outstanding bill".
 */
export function useOutstandingTotal() {
  const { data } = useQuery(billingQuery());
  return data && totalOutstanding(data.bills);
}

const paidSchema = z.object({
  payment: paymentSchema,
  /** What's left to pay on the bill afterwards. */
  balance: z.number(),
});
export type Paid = z.output<typeof paidSchema>;

/** The card as typed: the number with or without spaces, "MM/YY". */
export type CardDetails = { number: string; holder: string; expiry: string; cvv: string };

export type PayRequest =
  | { billId: string; method: "card"; card: CardDetails }
  | { billId: string; method: "bank_transfer" | "pos" };

/**
 * Pay a bill's balance: by card, or say it was paid by transfer or at the facility's POS (which
 * the facility then confirms). A 402 `card_declined` means the card was refused.
 * The card goes only into this request: it isn't kept (`gcTime: 0` drops the mutation, and its
 * variables, as soon as nothing watches it).
 */
export function usePayBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, ...body }: PayRequest) =>
      pendingAction(paidSchema, "Paying a bill", `/${encodeURIComponent(billId)}/pay`, {
        ...body,
        ...(body.method === "card"
          ? { card: { ...body.card, number: body.card.number.replace(/\s/g, "") } }
          : {}),
      }),
    gcTime: 0,
    onSettled: () => queryClient.invalidateQueries({ queryKey: billKeys.all }),
  });
}
