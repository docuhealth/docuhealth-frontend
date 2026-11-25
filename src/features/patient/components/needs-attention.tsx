import {
  CaretLeftIcon,
  CaretRightIcon,
  FlaskIcon,
  type Icon,
  PillIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CardSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import type { LabResult } from "@/features/patient/api/pending";
import { AllCaughtUp } from "@/features/patient/components/all-caught-up";
import { AttentionTab } from "@/features/patient/components/attention-tab";
import { LabResultsPanel } from "@/features/patient/components/lab-results-panel";
import {
  CurrentMedicinesPanel,
  PrescriptionPanel,
} from "@/features/patient/components/medicines-panel";
import type { AttentionItem } from "@/features/patient/lib/attention";
import { formatNaira } from "@/features/patient/lib/lab-results";

const icons: Record<AttentionItem["key"], Icon> = {
  results: FlaskIcon,
  medications: PillIcon,
  prescription: ReceiptIcon,
};

/**
 * "Needs your attention" on the patient's home: a row of tabs (results, medicines, bill,
 * prescription), arrows to step through them, and the chosen one's panel. `items` is `undefined`
 * while loading.
 */
export function NeedsAttention({
  items,
  labResults,
  outstandingBill,
}: {
  items: AttentionItem[] | undefined;
  labResults: LabResult[];
  /** Naira owed; null when there's none (or no billing yet). */
  outstandingBill: number | null;
}) {
  const [chosen, setChosen] = useState<AttentionItem["key"] | null>(null);
  const index = Math.max(
    0,
    (items ?? []).findIndex((item) => item.key === chosen),
  );
  const selected = items?.[index];
  const step = (by: number) => {
    if (!items?.length) return;
    setChosen(items[(index + by + items.length) % items.length]!.key);
  };

  const tab = (item: AttentionItem) => (
    <AttentionTab
      key={item.key}
      icon={icons[item.key]}
      label={item.label}
      value={item.value}
      newCount={item.newCount}
      selected={item.key === selected?.key}
      onSelect={() => setChosen(item.key)}
    />
  );

  return (
    <section aria-labelledby="attention-heading" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="attention-heading" className="type-title-sm text-fg-heading">
          Needs Your Attention
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous"
            disabled={!items || items.length < 2}
            onClick={() => step(-1)}
          >
            <CaretLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next"
            disabled={!items || items.length < 2}
            onClick={() => step(1)}
          >
            <CaretRightIcon />
          </Button>
          <Link
            to="/patient/health"
            className="ml-1 type-caption-semibold text-primary hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      {!items ? (
        <CardSkeleton lines={4} className="rounded-xl border bg-card p-6" />
      ) : items.length === 0 || !selected ? (
        <AllCaughtUp />
      ) : (
        <>
          <div
            role="tablist"
            aria-label="Needs your attention"
            className="flex [scrollbar-width:none] gap-3 overflow-x-auto"
          >
            {items.filter((item) => item.key !== "prescription").map(tab)}
            {/* TODO(api): bills come from the pending patient profile until billing exists. */}
            <AttentionTab
              icon={ReceiptIcon}
              label="Outstanding bill"
              value={outstandingBill ? formatNaira(outstandingBill) : "Nothing owed"}
              valueTone={outstandingBill ? "warning" : undefined}
            />
            {items.filter((item) => item.key === "prescription").map(tab)}
          </div>
          <SelectedPanel item={selected} labResults={labResults} />
        </>
      )}
    </section>
  );
}

function SelectedPanel({ item, labResults }: { item: AttentionItem; labResults: LabResult[] }) {
  switch (item.key) {
    case "results":
      return <LabResultsPanel visit={item.visit} results={labResults} fresh={item.newCount > 0} />;
    case "medications":
      return <CurrentMedicinesPanel drugs={item.drugs} />;
    case "prescription":
      return <PrescriptionPanel drug={item.drug} fresh={item.newCount > 0} />;
  }
}
