import { CalendarPlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/** "Need to see a doctor? Book at any connected facility", with a Book button. */
export function BookDoctorBanner({ onBook }: { onBook: () => void }) {
  return (
    <section
      aria-label="Need to see a doctor?"
      className="flex items-center gap-3 rounded-xl bg-line px-4 py-3"
    >
      <span className="grid size-9 shrink-0 place-content-center rounded-md bg-card text-fg-body">
        <CalendarPlusIcon aria-hidden className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="type-body-sm-medium text-fg-heading">Need to see a doctor?</p>
        <p className="type-caption text-fg-caption">Book at any connected facility</p>
      </div>
      <Button className="h-10 px-5 type-heading-sm" onClick={onBook}>
        Book
      </Button>
    </section>
  );
}
