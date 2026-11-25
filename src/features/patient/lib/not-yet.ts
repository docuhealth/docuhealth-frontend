import { toast } from "sonner";

/** A click handler for something the API can't do for patients yet: says so in a toast. */
export const notYet = (what: string) => () => toast.info(`${what} isn’t available yet.`);
