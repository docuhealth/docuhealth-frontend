import { useState } from "react";
import { OutstandingCard } from "@/features/patient/components/outstanding-card";
import type { FacilityOwing } from "@/features/patient/lib/bills";
import { cn } from "@/lib/utils";

/**
 * What's owed, one card per facility, the soonest due first; the dots below switch cards. With
 * nothing owed, one "all paid up" card.
 */
export function OutstandingCarousel({ owing }: { owing: FacilityOwing[] }) {
  const [index, setIndex] = useState(0);
  const shown = Math.min(index, Math.max(owing.length - 1, 0));
  const several = owing.length > 1;

  return (
    <section aria-label="Total outstanding" className="flex flex-col items-center gap-3">
      <div className="w-full">
        <OutstandingCard
          owing={owing[shown] ?? null}
          label={several ? `Outstanding · ${shown + 1} of ${owing.length}` : "Total outstanding"}
        />
      </div>
      {several ? (
        <div className="flex items-center gap-1.5">
          {owing.map((each, at) => (
            <button
              key={each.facility}
              type="button"
              aria-label={`Show ${each.facility}`}
              aria-current={at === shown}
              onClick={() => setIndex(at)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                at === shown ? "w-5 bg-primary" : "w-1.5 bg-divider hover:bg-fg-caption",
              )}
            />
          ))}
        </div>
      ) : (
        <span aria-hidden className="h-1.5 w-5 rounded-full bg-primary" />
      )}
    </section>
  );
}
