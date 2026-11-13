import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddIcon, CalendarAddIcon } from "@/features/radiologist/components/icons";

/** "Book Appointment" and "New Test", at the top right of the Overview and Scan Orders pages. */
export function ScanOrderActions() {
  return (
    <>
      <Button
        variant="outline"
        className="h-12 gap-2 bg-card px-4 type-body-sm-medium text-fg-heading has-data-[icon=inline-start]:pl-4"
        // TODO(design): open the booking dialog once the radiologist's is designed.
        onClick={() => toast.info("Booking appointments isn’t built yet.")}
      >
        <CalendarAddIcon data-icon="inline-start" className="size-5" />
        Book Appointment
      </Button>
      <Button
        className="h-12 gap-2 px-4 type-heading-sm has-data-[icon=inline-start]:pl-4"
        // TODO(design): open the new test form once it's designed.
        onClick={() => toast.info("Adding tests isn’t built yet.")}
      >
        <AddIcon data-icon="inline-start" className="size-5" />
        New Test
      </Button>
    </>
  );
}
