import { z } from "zod";
import {
  type PlanInterval,
  planIntervalLabels,
  type PlanRole,
  planRoleLabels,
} from "@/features/dh-admin/api/schemas";

/** A subscription plan's form: what it's called, costs, how often, who it's for, what it gives. */
export const planSchema = z.object({
  name: z.string().trim().min(1, "Enter the plan’s name"),
  price: z
    .string()
    .trim()
    .min(1, "Enter the price")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
      "Enter the price as a whole number of naira",
    ),
  interval: z.enum(Object.keys(planIntervalLabels) as [PlanInterval, ...PlanInterval[]]),
  role: z.enum(Object.keys(planRoleLabels) as [PlanRole, ...PlanRole[]]),
  description: z.string().trim().min(1, "Describe the plan"),
  features: z.string(),
});
export type PlanValues = z.infer<typeof planSchema>;
