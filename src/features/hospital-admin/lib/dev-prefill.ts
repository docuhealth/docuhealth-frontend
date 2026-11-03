import { env } from "@/env";
import type { AddFacilityInput, AddStaffInput } from "@/features/hospital-admin/lib/schemas";

/**
 * Sample answers so the dashboard's forms can be clicked through on the dev server. Never
 * applies to production builds, whatever VITE_PREFILL_FORMS says.
 */
const enabled = import.meta.env.DEV && env.VITE_PREFILL_FORMS;

export const devPrefill = enabled
  ? {
      addFacility: {
        type: "pharmacy",
        firstName: "Chinedu",
        lastName: "Obi",
        phone: "080-123-456-78",
        email: "chinedu.obi@luth.example.com",
      } satisfies AddFacilityInput,
      addStaff: {
        firstName: "Ngozi",
        lastName: "Okafor",
        phone: "080-234-567-89",
        role: "nurse",
        isAdmin: false,
        email: "ngozi.okafor@luth.example.com",
        password: "Welcome123!",
        // Filled from the template once the dialog opens.
        message: "",
      } satisfies AddStaffInput,
    }
  : undefined;
