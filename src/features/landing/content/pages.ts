import acpnImage from "@/assets/images/acpn.png";
import cacImage from "@/assets/images/cac.png";
import hospPharmImage from "@/assets/images/hosp-pharm.png";

// The public site's pages beyond the home page, as v1 published them.

export const mission = {
  title: "Our Mission",
  lead: "Our mission is to give every Nigerian lifelong, secure access to their complete medical records empowering individuals to take ownership of their health while enabling hospitals, doctors, and health insurers to work together in perfect harmony.",
  body: [
    "We envision a connected health ecosystem where every interaction from the first clinic visit to complex specialist care happens through a unified digital system that makes healthcare seamless, affordable, transparent, and trustworthy.",
    "Through innovation, data-driven insight, and strong partnerships with healthcare providers and policymakers, DocuHealth is building the backbone of a smarter Nigerian healthcare system one that ensures no medical history is ever lost, no patient is ever left behind, and no decision is made without the right information at the right time.",
  ],
};

export const vision = {
  title: "Our Vision",
  lead: "Our vision is to build Africa’s most trusted and intelligent health data network a secure digital backbone that connects every patient, provider, and payer into one unified ecosystem.",
  body: [
    "We imagine a continent where every medical journey is seamlessly connected, from the smallest rural clinic to the most advanced tertiary hospital. A future where doctors have instant access to accurate patient histories, insurers process claims transparently, and citizens can trust that their health data is protected, portable, and always within their control.",
    "By bridging the gaps between fragmented health systems, we aim to create a transparent, data-driven healthcare infrastructure that ensures continuity of care, accountability in spending, and equitable access for all Africans, regardless of location or income.",
    "At DocuHealth, we believe that when data flows freely and securely, care becomes smarter, faster, and fairer powering a new era of connected, affordable, and patient-centered healthcare across the African continent.",
  ],
};

export const api = {
  title: "DocuHealth API",
  lead: "DocuHealth introduces Nigeria’s first medical record interoperability API a powerful technology that allows hospitals, clinics, and health applications to securely connect, share, and access patient medical records in real time, regardless of the system they use.",
  body: [
    "This means healthcare providers can now exchange patient information instantly and safely, ensuring continuity of care, reducing paperwork, and making Nigeria’s healthcare system more connected, efficient, and data-driven.",
  ],
  uses: [
    "Care coordination",
    "Preventive health services",
    "Health-related research or analytics",
    "Health benefit programs",
    "Digital integrations that enhance patient experience",
  ],
  requestEmail: "admin@docuhealthservices.net",
  requestDocuments: [
    "Company/EMR Name",
    "NDPR Compliance Document",
    "CAC Certificate",
    "Partnership Letter with a registered health institution",
    "Other supporting document (optional)",
  ],
};

export type NewsArticle = {
  /** The article's anchor on the News page. */
  slug: string;
  date: string;
  title: string;
  summary: string;
  body: readonly string[];
  image: { src: string; alt: string } | null;
};

/** DocuHealth's news, newest first. The home page shows the ones with a picture. */
export const news: readonly NewsArticle[] = [
  {
    slug: "medical-summary-api",
    date: "Oct 30, 2025",
    title: "DocuHealth Medical Summary API has been launched",
    summary: "Hospitals, clinics and health tech developers can now share patient summaries.",
    body: [
      "DocuHealth, Nigeria’s leading digital health infrastructure provider, has officially launched its Medical Summary API, a groundbreaking solution designed to simplify the way healthcare organizations access, share, and manage patient information.",
      "The new API enables hospitals, clinics, and health tech developers to instantly upload and retrieve standardized patient summaries, including vital medical history, prescriptions, and diagnostic data, all securely integrated through DocuHealth’s centralized health platform.",
      "With this launch, DocuHealth continues its mission to digitize healthcare operations across Nigeria, from reception and patient registration to admissions and discharge management. The new API will help reduce paperwork, eliminate data duplication, and ensure that authorized medical professionals have access to the right information at the right time. The DocuHealth Medical Summary API is now available to registered hospitals and verified partners nationwide.",
    ],
    image: null,
  },
  {
    slug: "acpn-endorsement",
    date: "Oct 30, 2025",
    title: "ACPN (Osun State chapter) endorsement",
    summary: "Endorsed by the Association of Community Pharmacists of Nigeria, Osun State chapter.",
    body: ["Endorsed by the Association of Community Pharmacists of Nigeria, Osun State chapter."],
    image: { src: acpnImage, alt: "ACPN Osun State chapter endorsement document" },
  },
  {
    slug: "cac-certification",
    date: "Oct 30, 2025",
    title: "Corporate Affairs Commission (CAC) certification",
    summary: "Certified by the Corporate Affairs Commission of Nigeria.",
    body: ["Certified by the Corporate Affairs Commission of Nigeria."],
    image: { src: cacImage, alt: "Corporate Affairs Commission Certificate of Incorporation" },
  },
  {
    slug: "hospitals-and-pharmacies",
    date: "Oct 30, 2025",
    title: "Deployed in hospitals and pharmacies",
    summary: "Streamlining medical data exchange across Nigerian hospitals and pharmacies.",
    body: ["Streamlining medical data exchange across Nigerian hospitals and pharmacies."],
    image: {
      src: hospPharmImage,
      alt: "Healthcare workers deployed in hospitals and pharmacies",
    },
  },
];
