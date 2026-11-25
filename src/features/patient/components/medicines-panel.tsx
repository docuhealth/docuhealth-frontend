import { PillIcon, ReceiptIcon } from "@phosphor-icons/react";
import type { DrugRecord } from "@/features/patient/api/schemas";
import { AttentionPanel, AttentionRow } from "@/features/patient/components/attention-panel";
import { Tag } from "@/features/patient/components/tag";
import { dated } from "@/features/patient/lib/dated";
import { plural } from "@/lib/format";

/** The home page's current medicines: each one and since when. */
export function CurrentMedicinesPanel({ drugs }: { drugs: DrugRecord[] }) {
  return (
    <AttentionPanel
      icon={<PillIcon />}
      tone="info"
      title="Current medications"
      detail={`You’re on ${plural(drugs.length, "medicine")}`}
      link={{ to: "/patient/health/medications", label: "View medications" }}
    >
      {drugs.map((drug) => (
        <AttentionRow key={drug.id} name={drug.name}>
          <span className="type-caption text-fg-caption">Since {dated(drug.at)}</span>
        </AttentionRow>
      ))}
    </AttentionPanel>
  );
}

/** The home page's newest prescription: what it is and how to take it. */
export function PrescriptionPanel({ drug, fresh }: { drug: DrugRecord; fresh: boolean }) {
  return (
    <AttentionPanel
      icon={<ReceiptIcon />}
      tone="success"
      title="Latest prescription"
      detail={`Prescribed on ${dated(drug.at)}`}
      badge={fresh ? <Tag tone="success">New</Tag> : undefined}
      link={{ to: "/patient/health/medications", label: "View prescription" }}
    >
      <AttentionRow name={drug.name}>
        <span className="type-caption text-fg-caption">{drug.how || "—"}</span>
      </AttentionRow>
    </AttentionPanel>
  );
}
