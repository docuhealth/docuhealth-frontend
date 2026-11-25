import { ResultShareButton } from "@/features/patient/components/result-share-button";
import { Tag } from "@/features/patient/components/tag";
import { type LabTest, statusTag, testHeaderLine } from "@/features/patient/lib/results";

/** A test's title card: its name and status, when and where, and a share button. */
export function LabTestHeader({ test }: { test: LabTest }) {
  const tag = statusTag(test);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="type-title text-fg-heading">{test.name}</h1>
          <Tag tone={tag.tone}>{tag.label}</Tag>
        </div>
        <p className="type-caption text-fg-caption">{testHeaderLine(test)}</p>
      </div>
      <ResultShareButton />
    </div>
  );
}
