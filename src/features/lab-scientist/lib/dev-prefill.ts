import { env } from "@/env";
import type {
  BookTestValues,
  RejectOrderValues,
  SampleCollectionValues,
} from "@/features/lab-scientist/lib/schemas";
import { toIsoDate } from "@/lib/date-input";

/**
 * Sample answers so the lab scientist's forms can be clicked through on the dev server. Never
 * applies to production builds, whatever VITE_PREFILL_FORMS says.
 */
const enabled = import.meta.env.DEV && env.VITE_PREFILL_FORMS;

const pad = (n: number) => String(n).padStart(2, "0");
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
// A minute ago, so it's never in the future (or before an order made moments ago).
const justNow = new Date(Date.now() - 60_000);
const collected = {
  date: toIsoDate(justNow),
  time: `${pad(justNow.getHours())}:${pad(justNow.getMinutes())}`,
} satisfies SampleCollectionValues;

export const devPrefill = enabled
  ? {
      /** Finds Chidi Okafor in the mock API. */
      bookTestHin: "541-452-042-11",
      bookTest: { date: toIsoDate(tomorrow), time: "09:30", note: "" } satisfies BookTestValues,
      sampleCollection: collected,
      rejectOrder: {
        reason:
          "The sample was haemolysed and can’t be tested. Please collect a fresh sample and send a new request.",
      } satisfies RejectOrderValues,
      uploadResult: {
        interpretation:
          "All values are within the reference ranges.\nNo evidence of anaemia or infection.",
        clinicalCorrelation:
          "Correlate with the patient’s symptoms; repeat if they persist.\nNo further testing needed now.",
        ...collected,
      },
    }
  : undefined;
