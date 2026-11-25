import { describe, expect, it } from "vitest";
import type { Bill, Payment } from "@/features/patient/api/pending-bills";
import {
  billSplit,
  billsSubtitle,
  cardSchema,
  expiryPassed,
  formatBalance,
  formatCardNumber,
  formatExpiry,
  lastFour,
  methodWithCard,
  outstanding,
  owingByFacility,
  paymentDetail,
  paymentFacilities,
  paymentSummary,
  paymentsByMonth,
  splitTicks,
  totalOutstanding,
} from "@/features/patient/lib/bills";

const bill = (fields: Partial<Bill>): Bill => ({
  id: "bill",
  facility: "ABC Hospital",
  facilityArea: "Ikeja",
  invoice: "DB-20931",
  issuedAt: "2026-10-12T10:00:00Z",
  dueAt: null,
  services: [],
  billed: 125000,
  paidByYou: 80000,
  hmo: { name: "Hygeia", amount: 20000 },
  payTo: null,
  ...fields,
});

const payment = (fields: Partial<Payment>): Payment => ({
  id: "pay",
  billId: "bill",
  facility: "ABC Hospital",
  facilityArea: "Ikeja",
  at: "2026-11-06T10:00:00Z",
  amount: 25000,
  method: "card",
  status: "paid",
  reference: "RCT-77120",
  purpose: "Part payment",
  cardLast4: "4021",
  ...fields,
});

describe("what's owed", () => {
  it("is what's billed less the patient's and the HMO's share, never below nothing", () => {
    expect(outstanding(bill({}))).toBe(25000);
    expect(outstanding(bill({ paidByYou: 200000 }))).toBe(0);
    expect(totalOutstanding([bill({}), bill({ hmo: null, paidByYou: 120000 })])).toBe(30000);
  });

  it("adds up by facility, the soonest due first, pointing at the bill due first", () => {
    const owing = owingByFacility([
      bill({ id: "a1", dueAt: "2026-12-10T00:00:00Z" }),
      bill({ id: "paid", paidByYou: 105000 }),
      bill({ id: "r1", facility: "Reddington Hospital", dueAt: "2026-12-01T00:00:00Z" }),
      bill({ id: "a2", dueAt: "2026-12-05T00:00:00Z" }),
    ]);
    expect(owing).toEqual([
      {
        facility: "Reddington Hospital",
        amount: 25000,
        dueAt: "2026-12-01T00:00:00Z",
        billId: "r1",
      },
      { facility: "ABC Hospital", amount: 50000, dueAt: "2026-12-05T00:00:00Z", billId: "a2" },
    ]);
  });

  it("says so in the subtitle", () => {
    expect(billsSubtitle(0, [])).toBe("You’re all paid up");
    expect(
      billsSubtitle(25000, [
        { facility: "LUTH", amount: 25000, dueAt: "2026-10-25T10:00:00Z", billId: "b" },
      ]),
    ).toBe("₦25,000 outstanding · due 25 Oct");
    expect(
      billsSubtitle(25000, [{ facility: "LUTH", amount: 25000, dueAt: null, billId: "b" }]),
    ).toBe("₦25,000 outstanding");
    expect(formatBalance(0)).toBe("₦0.00");
    expect(formatBalance(25000)).toBe("₦25,000");
  });
});

describe("a bill's split", () => {
  it("is paid, HMO and outstanding, without the HMO when there's none", () => {
    expect(billSplit(bill({}))).toEqual([
      { key: "paid", label: "Paid by you", amount: 80000 },
      { key: "hmo", label: "HMO contribution · Hygeia", amount: 20000 },
      { key: "outstanding", label: "Outstanding", amount: 25000 },
    ]);
    expect(billSplit(bill({ hmo: null })).map((part) => part.key)).toEqual(["paid", "outstanding"]);
  });

  it("draws as ticks in proportion", () => {
    const ticks = splitTicks(billSplit(bill({})), 40);
    expect(ticks).toHaveLength(40);
    const count = (key: string) => ticks.filter((tick) => tick === key).length;
    expect([count("paid"), count("hmo"), count("outstanding")]).toEqual([26, 6, 8]);
    expect(splitTicks([], 40)).toEqual([]);
  });
});

describe("payments", () => {
  it("describe themselves for the page and the history", () => {
    expect(paymentSummary(payment({ purpose: "Lab tests", at: "2026-10-12T10:00:00Z" }))).toBe(
      "Lab tests · 12 Oct 2026",
    );
    expect(paymentDetail(payment({}))).toBe("6 Nov · Card · RCT-77120");
    expect(paymentDetail(payment({ status: "declined", reference: null }))).toBe(
      "6 Nov · Card declined",
    );
    expect(paymentDetail(payment({ method: "bank_transfer", status: "pending" }))).toBe(
      "6 Nov · Bank transfer · Awaiting confirmation",
    );
    expect(methodWithCard(payment({}))).toBe("Card •••• 4021");
    expect(methodWithCard(payment({ method: "pos", cardLast4: null }))).toBe("POS");
  });

  it("group by month, newest first, and list their facilities", () => {
    const payments = [
      payment({ id: "sep", facility: "LUTH", at: "2026-09-21T10:00:00Z" }),
      payment({ id: "nov", at: "2026-11-06T10:00:00Z" }),
      payment({ id: "oct", facility: "Reddington Lab", at: "2026-10-02T10:00:00Z" }),
      payment({ id: "oct2", at: "2026-10-14T10:00:00Z" }),
    ];
    expect(
      paymentsByMonth(payments).map((month) => [month.label, month.payments.map((p) => p.id)]),
    ).toEqual([
      ["November 2026", ["nov"]],
      ["October 2026", ["oct2", "oct"]],
      ["September 2026", ["sep"]],
    ]);
    expect(paymentFacilities(payments)).toEqual(["ABC Hospital", "Reddington Lab", "LUTH"]);
  });
});

describe("the card form", () => {
  it("formats the number, expiry and last four as typed", () => {
    expect(formatCardNumber("4084a0840840840812")).toBe("4084 0840 8408 4081 2");
    expect(formatCardNumber("")).toBe("");
    expect(formatExpiry("1228")).toBe("12/28");
    expect(formatExpiry("1")).toBe("1");
    expect(lastFour("4084 0840 8408 4021")).toBe("4021");
  });

  it("knows when a card has expired: after the end of its month", () => {
    const now = new Date(2026, 10, 26);
    expect(expiryPassed("11/26", now)).toBe(false);
    expect(expiryPassed("10/26", now)).toBe(true);
    expect(expiryPassed("01/27", now)).toBe(false);
  });

  it("checks every field", () => {
    const valid = { number: "4084 0840 8408 4081", holder: "Ada", expiry: "12/40", cvv: "123" };
    expect(cardSchema.safeParse(valid).success).toBe(true);
    expect(cardSchema.safeParse({ ...valid, number: "4084 0840" }).success).toBe(false);
    expect(cardSchema.safeParse({ ...valid, holder: "  " }).success).toBe(false);
    expect(cardSchema.safeParse({ ...valid, expiry: "13/40" }).success).toBe(false);
    expect(cardSchema.safeParse({ ...valid, expiry: "01/20" }).success).toBe(false);
    expect(cardSchema.safeParse({ ...valid, cvv: "12" }).success).toBe(false);
    expect(cardSchema.safeParse({ ...valid, cvv: "1234" }).success).toBe(true);
  });
});
