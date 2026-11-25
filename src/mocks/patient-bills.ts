import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}/api/pending/patient/bills${path}`;

// TODO(api): demo bills and payments for the patient (src/features/patient/api/pending-bills.ts).
// Only the mock dev server asks for these. ABC Hospital and Reddington Hospital are owed; the
// Reddington Lab and LUTH bills are paid (one LUTH card payment was declined first). Paying
// changes this in memory until the page reloads. A card number ending 0002 is always declined,
// to show that error. Card details are only checked here, never logged or kept.

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};
const daysAhead = (days: number) => daysAgo(-days, 23, 59);

type Bill = {
  id: string;
  facility: string;
  facilityArea: string | null;
  invoice: string;
  issuedAt: string;
  dueAt: string | null;
  services: { name: string; department: string | null; amount: number }[];
  billed: number;
  paidByYou: number;
  hmo: { name: string; amount: number } | null;
  payTo: { bank: string; accountName: string; accountNumber: string } | null;
};

type Payment = {
  id: string;
  billId: string | null;
  facility: string;
  facilityArea: string | null;
  at: string;
  amount: number;
  method: "card" | "bank_transfer" | "pos";
  status: "paid" | "declined" | "pending";
  reference: string | null;
  purpose: string | null;
  cardLast4: string | null;
};

const bills: Bill[] = [
  {
    id: "bill-abc",
    facility: "ABC Hospital",
    facilityArea: "Ikeja",
    invoice: "DB-20931",
    issuedAt: daysAgo(45),
    dueAt: daysAhead(5),
    services: [
      { name: "Consultation", department: "Internal Medicine", amount: 15000 },
      { name: "Full Blood Count", department: "Laboratory", amount: 12000 },
      { name: "Lipid profile", department: "Laboratory", amount: 18000 },
      { name: "Chest X-ray", department: "Radiology", amount: 35000 },
      { name: "Ward stay, 1 night", department: "Nursing", amount: 45000 },
    ],
    billed: 125000,
    paidByYou: 80000,
    hmo: { name: "Hygeia", amount: 20000 },
    payTo: { bank: "Zenith Bank", accountName: "ABC Hospital Ltd", accountNumber: "1012345678" },
  },
  {
    id: "bill-reddington",
    facility: "Reddington Hospital",
    facilityArea: "Victoria Island",
    invoice: "RH-11842",
    issuedAt: daysAgo(10),
    dueAt: daysAhead(12),
    services: [
      { name: "Eye examination", department: "Ophthalmology", amount: 18000 },
      { name: "Retinal photography", department: "Ophthalmology", amount: 12000 },
    ],
    billed: 30000,
    paidByYou: 0,
    hmo: { name: "AXA Mansard", amount: 12000 },
    payTo: {
      bank: "Guaranty Trust Bank",
      accountName: "Reddington Multi-Specialist Hospital",
      accountNumber: "0123456789",
    },
  },
  {
    id: "bill-reddington-lab",
    facility: "Reddington Lab",
    facilityArea: null,
    invoice: "RL-5521",
    issuedAt: daysAgo(46),
    dueAt: null,
    services: [
      { name: "Lipid panel", department: "Chemistry", amount: 10500 },
      { name: "HbA1c", department: "Chemistry", amount: 8000 },
    ],
    billed: 18500,
    paidByYou: 18500,
    hmo: null,
    payTo: null,
  },
  {
    id: "bill-luth",
    facility: "LUTH",
    facilityArea: "Idi-Araba",
    invoice: "LU-30417",
    issuedAt: daysAgo(160),
    dueAt: null,
    services: [
      { name: "Consultation", department: "General Outpatients", amount: 8000 },
      { name: "Malaria test", department: "Laboratory", amount: 4500 },
      { name: "Medicines", department: "Pharmacy", amount: 8000 },
    ],
    billed: 20500,
    paidByYou: 20500,
    hmo: null,
    payTo: null,
  },
];

const [abc, , lab, luth] = bills as [Bill, Bill, Bill, Bill];

const paid = (
  id: string,
  bill: Bill,
  fields: Pick<Payment, "at" | "amount" | "method" | "purpose"> & Partial<Payment>,
): Payment => ({
  id,
  billId: bill.id,
  facility: bill.facility,
  facilityArea: bill.facilityArea,
  status: "paid",
  reference: null,
  cardLast4: null,
  ...fields,
});

const payments: Payment[] = [
  paid("pay-abc", abc, {
    at: daysAgo(40, 13, 5),
    amount: 80000,
    method: "bank_transfer",
    reference: "RCT-76004",
    purpose: "Part payment",
  }),
  paid("pay-lab", lab, {
    at: daysAgo(44, 9, 40),
    amount: 18500,
    method: "pos",
    reference: "RCT-75218",
    purpose: "Lab tests",
  }),
  paid("pay-luth-declined", luth, {
    at: daysAgo(160, 11, 0),
    amount: 8000,
    method: "card",
    status: "declined",
    cardLast4: "4021",
    purpose: "Consultation",
  }),
  paid("pay-luth", luth, {
    at: daysAgo(160, 11, 6),
    amount: 12500,
    method: "card",
    reference: "RCT-73390",
    cardLast4: "4021",
    purpose: "Consultation",
  }),
  paid("pay-luth-medicines", luth, {
    at: daysAgo(152, 15, 30),
    amount: 8000,
    method: "card",
    reference: "RCT-73811",
    cardLast4: "4021",
    purpose: "Medicines",
  }),
];

const outstanding = (bill: Bill) =>
  Math.max(0, bill.billed - bill.paidByYou - (bill.hmo?.amount ?? 0));

let nextReference = 77310;

type PayBody = {
  method?: string;
  card?: { number?: string; holder?: string; expiry?: string; cvv?: string };
};

export const patientBillHandlers = [
  http.get(api(""), () => HttpResponse.json({ bills, payments })),

  http.post(api("/:id/pay"), async ({ params, request }) => {
    const bill = bills.find((each) => each.id === params.id);
    if (!bill) return HttpResponse.json({ detail: "Bill not found" }, { status: 404 });
    const amount = outstanding(bill);
    if (amount === 0) {
      return HttpResponse.json(
        { code: "already_paid", detail: "This bill is already paid." },
        { status: 409 },
      );
    }

    const body = (await request.json()) as PayBody;
    const method =
      body.method === "bank_transfer" || body.method === "pos" ? body.method : ("card" as const);
    const number = body.card?.number ?? "";
    if (method === "card" && !/^\d{16,19}$/.test(number)) {
      return HttpResponse.json({ detail: "Enter a valid card number." }, { status: 400 });
    }
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      billId: bill.id,
      facility: bill.facility,
      facilityArea: bill.facilityArea,
      at: new Date().toISOString(),
      amount,
      method,
      status: method === "card" ? "paid" : "pending",
      reference: `DB-PAY-${nextReference++}`,
      purpose: "Balance",
      cardLast4: method === "card" ? number.slice(-4) : null,
    };

    if (method === "card" && number.endsWith("0002")) {
      payments.push({ ...payment, status: "declined", reference: null });
      return HttpResponse.json(
        {
          code: "card_declined",
          detail: "Your card was declined. Try another card, or pay by bank transfer.",
        },
        { status: 402 },
      );
    }

    payments.push(payment);
    if (method === "card") bill.paidByYou += amount;
    return HttpResponse.json({ payment, balance: outstanding(bill) }, { status: 201 });
  }),
];
