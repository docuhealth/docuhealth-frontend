import { z } from "zod";

/** The span a dashboard's numbers cover, picked with `PeriodSelect`. */
export const periodLabels = { today: "Today", week: "This Week", month: "This Month" } as const;
export type Period = keyof typeof periodLabels;
export const periodSchema = z.enum(Object.keys(periodLabels) as [Period, ...Period[]]);
