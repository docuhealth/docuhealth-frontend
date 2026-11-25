import { CaretRightIcon } from "@phosphor-icons/react";
import allergiesIconUrl from "@/assets/svgs/allergies.svg";
import bloodGroupIconUrl from "@/assets/svgs/blood-group.svg";
import conditionsIconUrl from "@/assets/svgs/conditions.svg";
import genotypeIconUrl from "@/assets/svgs/genotype.svg";
import { SummaryTile } from "@/features/patient/components/summary-tile";
import { notYet } from "@/features/patient/lib/not-yet";

/**
 * The Health page's summary: blood group, genotype, active conditions and allergies.
 * TODO(api): blood group, genotype and allergies are pending records (api/pending.ts).
 */
export function HealthSummary({
  bloodGroup,
  genotype,
  activeConditions,
  allergies,
}: {
  bloodGroup: string | null;
  genotype: string | null;
  activeConditions: number | null;
  /** e.g. "Penicillin, +2 more". */
  allergies: string | null;
}) {
  return (
    <section aria-labelledby="summary-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-lg bg-card px-4 py-3">
        <h2 id="summary-heading" className="type-title-sm text-fg-heading">
          Health summary
        </h2>
        {/* TODO(design): the full summary page comes with a later batch of screens. */}
        <button
          type="button"
          onClick={notYet("The full health summary")}
          className="flex items-center gap-1 type-caption-semibold text-primary hover:underline"
        >
          View all
          <CaretRightIcon className="size-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile icon={bloodGroupIconUrl} label="Blood group" value={bloodGroup} />
        <SummaryTile icon={genotypeIconUrl} label="Genotype" value={genotype} />
        <SummaryTile
          icon={conditionsIconUrl}
          label="Conditions"
          value={activeConditions ? `${activeConditions} Active` : null}
        />
        <SummaryTile icon={allergiesIconUrl} label="Allergies" value={allergies} alert />
      </div>
    </section>
  );
}
