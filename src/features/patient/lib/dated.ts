import { formatDate } from "@/lib/format";

/** An API timestamp as the record pages print it. */
export const dated = (at: string) => formatDate(new Date(at));
