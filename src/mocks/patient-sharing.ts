import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}/api/pending/patient/sharing${path}`;

// TODO(api): demo data and actions for the patient's Sharing & privacy screens
// (src/features/patient/api/pending-sharing.ts). Only the mock dev server asks for these.
// Two running shares (Dr. Adaeze Okafor at ABC Hospital, and Dr. Kemi Bello at Reddington
// Hospital, which ends soon), one the patient stopped, a few views, and the people at each demo
// facility. The one-time code is always 123456. Sharing, stopping and the privacy switches change
// this in memory until the page reloads.

const CODE = "123456";

const daysFrom = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

type Share = {
  id: string;
  recipient: { name: string; role: string | null };
  facility: { name: string; area: string | null };
  items: string[];
  createdAt: string;
  expiresAt: string;
  stoppedAt: string | null;
};

const people = [
  {
    id: "doc-okafor",
    name: "Dr. Adaeze Okafor",
    role: "Consultant Physician",
    facility: "ABC Hospital",
    facilityArea: "Ikeja",
  },
  {
    id: "doc-adeyemi",
    name: "Dr. Isaac Adeyemi",
    role: "General Practitioner",
    facility: "ABC Hospital",
    facilityArea: "Ikeja",
  },
  {
    id: "doc-doe",
    name: "Dr. John Doe",
    role: "Cardiologist",
    facility: "ABC Hospital",
    facilityArea: "Ikeja",
  },
  {
    id: "doc-bello",
    name: "Dr. Kemi Bello",
    role: "Endocrinologist",
    facility: "Reddington Hospital",
    facilityArea: null,
  },
  {
    id: "doc-eze",
    name: "Dr. Chidi Eze",
    role: "Ophthalmologist",
    facility: "Reddington Hospital",
    facilityArea: null,
  },
  {
    id: "doc-balogun",
    name: "Dr. Tunde Balogun",
    role: "Consultant Surgeon",
    facility: "LUTH",
    facilityArea: "Idi-Araba",
  },
  {
    id: "lab-nwosu",
    name: "Ngozi Nwosu",
    role: "Lab Scientist",
    facility: "Reddington Lab",
    facilityArea: null,
  },
];

const shares: Share[] = [
  {
    id: "share-1",
    recipient: { name: "Dr. Adaeze Okafor", role: "Consultant Physician" },
    facility: { name: "ABC Hospital", area: "Ikeja" },
    items: ["health_summary", "medications"],
    createdAt: daysFrom(-20),
    expiresAt: daysFrom(36),
    stoppedAt: null,
  },
  {
    id: "share-2",
    recipient: { name: "Dr. Kemi Bello", role: "Endocrinologist" },
    facility: { name: "Reddington Hospital", area: null },
    items: ["lab_results", "allergies"],
    createdAt: daysFrom(-5),
    expiresAt: daysFrom(2),
    stoppedAt: null,
  },
  {
    id: "share-3",
    recipient: { name: "Dr. Tunde Balogun", role: "Consultant Surgeon" },
    facility: { name: "LUTH", area: "Idi-Araba" },
    items: ["radiology", "visit_summaries"],
    createdAt: daysFrom(-60),
    expiresAt: daysFrom(30),
    stoppedAt: daysFrom(-40),
  },
];

const history = [
  {
    id: "view-1",
    viewer: { name: "Dr. Kemi Bello", role: "Endocrinologist" },
    facility: "Reddington Hospital",
    item: "lab_results",
    at: hoursAgo(3),
  },
  {
    id: "view-2",
    viewer: { name: "Dr. Kemi Bello", role: "Endocrinologist" },
    facility: "Reddington Hospital",
    item: "allergies",
    at: hoursAgo(4),
  },
  {
    id: "view-3",
    viewer: { name: "Dr. Adaeze Okafor", role: "Consultant Physician" },
    facility: "ABC Hospital",
    item: "health_summary",
    at: hoursAgo(50),
  },
  {
    id: "view-4",
    viewer: { name: "Dr. Adaeze Okafor", role: "Consultant Physician" },
    facility: "ABC Hospital",
    item: "medications",
    at: hoursAgo(52),
  },
  {
    id: "view-5",
    viewer: { name: "Dr. Tunde Balogun", role: "Consultant Surgeon" },
    facility: "LUTH",
    item: "radiology",
    at: hoursAgo(24 * 45),
  },
];

let privacy = { emergencyAccess: true, careTeams: true, research: false };

const durationDays: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };

type Request = {
  facility: string;
  personId: string;
  items: string[];
  duration: string;
};
const requests = new Map<string, Request>();

const sent = (requestId: string) =>
  HttpResponse.json({ requestId, sentTo: "+234 ••• ••• 4821" }, { status: 201 });

const accessCode = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * letters.length)]).join(
    "",
  );
};

export const patientSharingHandlers = [
  http.get(api("/shares"), () => HttpResponse.json(shares)),
  http.get(api("/history"), () => HttpResponse.json(history)),
  http.get(api("/privacy"), () => HttpResponse.json(privacy)),
  http.get(api("/people"), () => HttpResponse.json(people)),

  http.post(api("/shares"), async ({ request }) => {
    const body = (await request.json()) as Request;
    const id = `req-${Date.now()}`;
    requests.set(id, body);
    return sent(id);
  }),

  http.post(api("/requests/:id/resend"), ({ params }) => sent(String(params.id))),

  http.post(api("/requests/:id/verify"), async ({ params, request }) => {
    const { code } = (await request.json()) as { code: string };
    if (code !== CODE) {
      return HttpResponse.json(
        { code: "wrong_code", message: "That code isn’t right. Check the SMS and try again." },
        { status: 400 },
      );
    }
    const asked = requests.get(String(params.id));
    if (!asked) {
      return HttpResponse.json(
        { code: "expired", message: "That request has expired. Start again." },
        { status: 404 },
      );
    }
    requests.delete(String(params.id));
    const person = people.find((each) => each.id === asked.personId) ?? people[0]!;
    const expiresAt = new Date(Date.now() + (durationDays[asked.duration] ?? 7) * 86_400_000);
    const share: Share = {
      id: `share-${Date.now()}`,
      recipient: { name: person.name, role: person.role },
      facility: { name: person.facility, area: person.facilityArea },
      items: asked.items,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      stoppedAt: null,
    };
    shares.unshift(share);
    const issued = accessCode();
    return HttpResponse.json(
      { share, accessCode: issued, link: `https://docuhealth.app/shared/${issued}` },
      { status: 201 },
    );
  }),

  http.post(api("/shares/:id/stop"), ({ params }) => {
    const share = shares.find((each) => each.id === params.id);
    if (!share) return HttpResponse.json({ message: "That share has ended." }, { status: 404 });
    share.stoppedAt = new Date().toISOString();
    return HttpResponse.json(share);
  }),

  http.post(api("/privacy"), async ({ request }) => {
    privacy = (await request.json()) as typeof privacy;
    return HttpResponse.json(privacy);
  }),
];
