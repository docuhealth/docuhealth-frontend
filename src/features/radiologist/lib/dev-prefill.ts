import { env } from "@/env";
import type {
  ImagingTimeValues,
  RejectOrderValues,
  UploadResultInput,
} from "@/features/radiologist/lib/schemas";
import { toIsoDate } from "@/lib/date-input";

/**
 * Sample answers so the radiologist's forms can be clicked through on the dev server. Never
 * applies to production builds, whatever VITE_PREFILL_FORMS says.
 */
const enabled = import.meta.env.DEV && env.VITE_PREFILL_FORMS;

/** A placeholder scan image, so the attachments step has something to show. */
function sampleScan(name: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#1f2937"/><ellipse cx="100" cy="100" rx="60" ry="80" fill="#9ca3af" opacity=".6"/></svg>`;
  return new File([svg], name, { type: "image/svg+xml" });
}

// An hour ago, so the report's time is never in the future.
const reported = new Date(Date.now() - 60 * 60_000);
const pad = (n: number) => String(n).padStart(2, "0");

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export const devPrefill = enabled
  ? {
      imagingTime: { date: toIsoDate(tomorrow), time: "10:30" } satisfies ImagingTimeValues,
      rejectOrder: {
        reason:
          "The requested scan doesn’t match the clinical question. Please confirm the imaging type with the requesting doctor and send a new request.",
      } satisfies RejectOrderValues,
      uploadResult: {
        reporterName: "Dr. Emeka Obi",
        specialty: "radiologist",
        date: toIsoDate(reported),
        time: `${pad(reported.getHours())}:${pad(reported.getMinutes())}`,
        clinicalIndication:
          "Persistent cough and shortness of breath for 3 weeks, with a history of smoking (20 pack-years).",
        findings:
          "No evidence of pulmonary embolism.\nAdrenal glands and upper abdominal structures are unremarkable.",
        impression:
          "6 mm right upper lobe nodule, likely benign. Mild centrilobular emphysema, consistent with smoking history.",
        recommendations:
          "Follow-up CT in 6 months to monitor the nodule. Smoking cessation counselling strongly advised.",
        attachments: [sampleScan("scan-axial.svg"), sampleScan("scan-coronal.svg")],
        comment: "",
      } satisfies UploadResultInput,
    }
  : undefined;
