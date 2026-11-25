import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Pending from "@/features/patient/api/pending-bills";
import type { Billing } from "@/features/patient/api/pending-bills";
import { BillDetails } from "@/features/patient/components/bill-details";
import { BillsPage } from "@/features/patient/components/bills-page";
import { PaymentHistoryPage } from "@/features/patient/components/payment-history-page";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// Bills and payments are TODO(api) and empty off the mock dev server, so they're handed to the
// pending query here; paying isn't mocked, so it fails as it would on staging.
const pending = vi.hoisted(() => ({ billing: { bills: [], payments: [] } as unknown }));

vi.mock("@/features/patient/api/pending-bills", async (importOriginal) => {
  const actual = await importOriginal<typeof Pending>();
  return {
    ...actual,
    billingQuery: () => ({
      ...actual.billingQuery(),
      queryFn: () => Promise.resolve(pending.billing as Billing),
    }),
  };
});

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
};

const abc = {
  id: "bill-abc",
  facility: "ABC Hospital",
  facilityArea: "Ikeja",
  invoice: "DB-20931",
  issuedAt: "2026-10-12T10:00:00Z",
  dueAt: daysFromNow(5),
  services: [
    { name: "Consultation", department: "Internal Medicine", amount: 15000 },
    { name: "Chest X-ray", department: "Radiology", amount: 110000 },
  ],
  billed: 125000,
  paidByYou: 80000,
  hmo: { name: "Hygeia", amount: 20000 },
  payTo: { bank: "Zenith Bank", accountName: "ABC Hospital Ltd", accountNumber: "1012345678" },
};

const lab = {
  ...abc,
  id: "bill-lab",
  facility: "Reddington Lab",
  facilityArea: null,
  invoice: "RL-5521",
  dueAt: null,
  billed: 18500,
  paidByYou: 18500,
  hmo: null,
  payTo: null,
};

const payment = (id: string, fields: object) => ({
  id,
  billId: "bill-abc",
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

const demo = {
  bills: [abc, lab],
  payments: [
    payment("nov", {}),
    payment("lab", {
      billId: "bill-lab",
      facility: "Reddington Lab",
      facilityArea: null,
      at: "2026-10-02T10:00:00Z",
      amount: 18500,
      method: "pos",
      reference: "RCT-75218",
      purpose: "Lab tests",
    }),
    payment("declined", {
      billId: null,
      facility: "LUTH",
      facilityArea: "Idi-Araba",
      at: "2026-09-21T10:00:00Z",
      amount: 8000,
      status: "declined",
      reference: null,
    }),
  ],
};

beforeEach(() => {
  pending.billing = { bills: [], payments: [] };
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

describe("Bills & payments", () => {
  it("says the patient is all paid up and has no bills yet", async () => {
    renderWithRouter(<BillsPage />);
    expect(await screen.findByText("No bills yet")).toBeInTheDocument();
    const card = screen.getByRole("region", { name: "Total outstanding" });
    expect(card).toHaveTextContent("₦0.00");
    expect(card).toHaveTextContent("You’re all paid up");
    expect(card).toHaveTextContent("Up to date");
  });

  it("shows what's owed with a way to pay, and the latest payments", async () => {
    pending.billing = demo;
    renderWithRouter(<BillsPage />);
    const card = await screen.findByRole("region", { name: "Total outstanding" });
    expect(card).toHaveTextContent("₦25,000");
    expect(card).toHaveTextContent("To ABC Hospital");
    expect(card).toHaveTextContent(/Due \d+ \w{3}/);
    expect(within(card).getByRole("link", { name: "Pay ABC Hospital" })).toHaveAttribute(
      "href",
      "/patient/bills/bill-abc",
    );

    const recent = screen.getByRole("list", { name: "Recent payments" });
    expect(within(recent).getAllByRole("listitem")).toHaveLength(3);
    expect(recent).toHaveTextContent("Lab tests · 02 Oct 2026");
    expect(screen.getByRole("link", { name: "See all" })).toHaveAttribute(
      "href",
      "/patient/bills/history",
    );
  });

  it("switches between facilities owed with the dots", async () => {
    pending.billing = {
      ...demo,
      bills: [abc, { ...lab, facility: "LUTH", paidByYou: 0, dueAt: daysFromNow(9) }],
    };
    const { user } = renderWithRouter(<BillsPage />);
    const card = await screen.findByRole("region", { name: "Total outstanding" });
    expect(card).toHaveTextContent("Outstanding · 1 of 2");
    expect(card).toHaveTextContent("To ABC Hospital");
    await user.click(within(card).getByRole("button", { name: "Show LUTH" }));
    expect(card).toHaveTextContent("To LUTH");
    expect(card).toHaveTextContent("₦18,500");
  });
});

describe("Payment history", () => {
  it("groups payments by month and filters by facility", async () => {
    pending.billing = demo;
    const { user } = renderWithRouter(<PaymentHistoryPage />);
    const november = await screen.findByRole("region", { name: "November 2026" });
    expect(november).toHaveTextContent("ABC Hospital, Ikeja");
    expect(november).toHaveTextContent("6 Nov · Card · RCT-77120");
    expect(screen.getByRole("region", { name: "September 2026" })).toHaveTextContent(
      "21 Sep · Card declined",
    );

    await user.click(screen.getByRole("button", { name: "LUTH" }));
    expect(screen.queryByRole("region", { name: "November 2026" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "September 2026" })).toBeInTheDocument();
  });

  it("says when there are no payments", async () => {
    renderWithRouter(<PaymentHistoryPage />);
    expect(await screen.findByText("No payments yet")).toBeInTheDocument();
  });
});

describe("Bill detail", () => {
  it("shows the balance, services and how the bill splits", async () => {
    pending.billing = demo;
    renderWithRouter(<BillDetails billId="bill-abc" />);
    const summary = await screen.findByRole("region", { name: "Outstanding balance" });
    expect(summary).toHaveTextContent("₦25,000");
    expect(summary).toHaveTextContent("ABC Hospital, Ikeja · Invoice DB-20931 · 12 Oct 2026");
    expect(screen.getByRole("list", { name: "Services charged" })).toHaveTextContent(
      "Chest X-rayRadiology₦110,000",
    );
    const split = screen.getByRole("region", { name: "Amount billed" });
    expect(split).toHaveTextContent("₦125,000");
    expect(split).toHaveTextContent("HMO contribution · Hygeia₦20,000");
    expect(screen.getByRole("link", { name: /Message billing/ })).toHaveAttribute(
      "href",
      "/patient/messages",
    );
  });

  it("says a paid bill is paid in full, without a way to pay", async () => {
    pending.billing = demo;
    renderWithRouter(<BillDetails billId="bill-lab" />);
    expect(await screen.findByText("Paid in full")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue to payment" })).not.toBeInTheDocument();
  });

  it("checks the card, then says paying isn't available yet off the mock server", async () => {
    pending.billing = demo;
    const { user } = renderWithRouter(<BillDetails billId="bill-abc" />);
    await user.click(await screen.findByRole("button", { name: "Continue to payment" }));
    const dialog = await screen.findByRole("dialog", { name: "Pay bill" });
    expect(dialog).toHaveTextContent("₦25,000 to ABC Hospital, Ikeja · Invoice DB-20931");

    await user.click(within(dialog).getByRole("button", { name: "Pay ₦25,000" }));
    expect(within(dialog).getByText("Enter your card number")).toBeInTheDocument();
    expect(within(dialog).getByText("Enter the expiry as MM/YY")).toBeInTheDocument();

    const number = within(dialog).getByLabelText(/Card Number/);
    await user.type(number, "4084084084084081");
    expect(number).toHaveValue("4084 0840 8408 4081");
    await user.type(within(dialog).getByLabelText(/Card Holder/), "Chinonso Okafor");
    const expiry = within(dialog).getByLabelText(/Expiry Date/);
    await user.type(expiry, "1240");
    expect(expiry).toHaveValue("12/40");
    await user.type(within(dialog).getByLabelText(/CVV/), "123");
    await user.click(within(dialog).getByRole("button", { name: "Pay ₦25,000" }));
    expect(await screen.findByText(/Paying a bill isn’t available yet/)).toBeInTheDocument();
  });

  it("gives the account to transfer to", async () => {
    pending.billing = demo;
    const { user } = renderWithRouter(<BillDetails billId="bill-abc" />);
    await user.click(await screen.findByRole("button", { name: "Continue to payment" }));
    const dialog = await screen.findByRole("dialog", { name: "Pay bill" });
    await user.click(within(dialog).getByRole("tab", { name: "Bank transfer" }));
    expect(dialog).toHaveTextContent("Zenith Bank");
    expect(dialog).toHaveTextContent("1012345678");
    expect(within(dialog).getByRole("button", { name: "I’ve paid" })).toBeInTheDocument();
  });
});
