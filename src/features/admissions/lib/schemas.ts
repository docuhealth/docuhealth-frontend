import { z } from "zod";

/** The Reject Admission dialog: why, for the requesting doctor (the API keeps 500 characters). */
export const rejectAdmissionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Say why you’re rejecting this request")
    .max(500, "Keep the reason to 500 characters"),
});
export type RejectAdmissionValues = z.infer<typeof rejectAdmissionSchema>;
