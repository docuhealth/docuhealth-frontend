import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  FlaskIcon,
  type Icon,
  PillIcon,
  ReceiptIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CardSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import { AttentionPanel, AttentionRow } from "@/features/patient/components/attention-panel";
import { AttentionTab } from "@/features/patient/components/attention-tab";
import { Tag } from "@/features/patient/components/tag";
import type { AttentionItem } from "@/features/patient/lib/attention";
import { orderStatusLabel } from "@/features/patient/lib/records";
import { formatDate, plural } from "@/lib/format";

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
export function NeedsAttention({ items }: { items: AttentionItem[] | undefined }) {
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
            {items.map((item) => (
              <AttentionTab
                key={item.key}
                icon={icons[item.key]}
                label={item.label}
                value={item.value}
                newCount={item.newCount}
                selected={item.key === selected.key}
                onSelect={() => setChosen(item.key)}
              />
            ))}
            {/* TODO(api): no billing for patients yet. */}
            <AttentionTab
              icon={WalletIcon}
              label="Outstanding bill"
              value="Not available yet"
              muted
            />
          </div>
          <SelectedPanel item={selected} />
        </>
      )}
    </section>
  );
}

function SelectedPanel({ item }: { item: AttentionItem }) {
  switch (item.key) {
    case "results": {
      const { visit } = item;
      return (
        <AttentionPanel
          icon={<FlaskIcon />}
          tone="warning"
          title="Recent results"
          detail={`${plural(visit.labTests.length, "test")} from your visit on ${formatDate(new Date(visit.at))}`}
          badge={item.newCount > 0 ? <Tag tone="success">New</Tag> : undefined}
          link={{
            to: "/patient/health/visits/$visitId",
            params: { visitId: visit.id },
            label: "View result",
          }}
        >
          {visit.labTests.map((test) => (
            <AttentionRow key={test.name} name={test.name}>
              {/* TODO(api): no result values or reference ranges for patients yet. */}
              <Tag tone={test.status === "pending" ? "warning" : "success"}>
                {orderStatusLabel(test.status) ?? "—"}
              </Tag>
            </AttentionRow>
          ))}
        </AttentionPanel>
      );
    }
    case "medications":
      return (
        <AttentionPanel
          icon={<PillIcon />}
          tone="info"
          title="Current medications"
          detail={`You’re on ${plural(item.drugs.length, "medicine")}`}
          link={{ to: "/patient/health/medications", label: "View medications" }}
        >
          {item.drugs.map((drug) => (
            <AttentionRow key={drug.id} name={drug.name}>
              <span className="type-caption text-fg-caption">
                Since {formatDate(new Date(drug.at))}
              </span>
            </AttentionRow>
          ))}
        </AttentionPanel>
      );
    case "prescription":
      return (
        <AttentionPanel
          icon={<ReceiptIcon />}
          tone="success"
          title="Latest prescription"
          detail={`Prescribed on ${formatDate(new Date(item.drug.at))}`}
          badge={item.newCount > 0 ? <Tag tone="success">New</Tag> : undefined}
          link={{ to: "/patient/health/medications", label: "View prescription" }}
        >
          <AttentionRow name={item.drug.name}>
            <span className="type-caption text-fg-caption">{item.drug.how || "—"}</span>
          </AttentionRow>
        </AttentionPanel>
      );
  }
}

function AllCaughtUp() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-16 text-center">
      <span className="grid size-16 place-content-center rounded-full bg-success-100">
        <CheckCircleIcon weight="fill" className="size-10 text-success-500" />
      </span>
      <p className="type-title-sm text-fg-heading">You’re all caught up</p>
      <p className="max-w-80 type-body-sm-regular text-fg-caption">
        New results, medications and bills will show up here as soon as a facility shares them.
      </p>
    </div>
  );
}
