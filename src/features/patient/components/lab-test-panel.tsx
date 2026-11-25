import {
  DetailRows,
  RecordList,
  RecordRow,
  SectionLabel,
} from "@/features/patient/components/patient-ui";
import { ScanNote } from "@/features/patient/components/scan-note";
import { Tag } from "@/features/patient/components/tag";
import { flagTag, type LabTest, valueRowDetail } from "@/features/patient/lib/results";
import { scanTime } from "@/features/patient/lib/scans";
import { plural } from "@/lib/format";

/** A test whose results are out: each value against its range, and who ordered it when. */
export function LabTestPanel({ test }: { test: LabTest }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-2">
        <SectionLabel>{plural(test.values.length, "result")}</SectionLabel>
        {test.values.length ? (
          <RecordList label="Results">
            {test.values.map((value) => (
              <RecordRow
                key={value.id}
                title={value.name}
                meta={valueRowDetail(value)}
                status={<Tag tone={flagTag(value.flag).tone}>{flagTag(value.flag).label}</Tag>}
                to="/patient/health/results/$resultId/$valueId"
                params={{ resultId: test.id, valueId: value.id }}
              />
            ))}
          </RecordList>
        ) : (
          // TODO(api): the visit says the results are out, but no values were shared.
          <ScanNote>The values will show here once the lab shares them with you.</ScanNote>
        )}
      </div>
      <DetailRows
        rows={[
          ["Ordered by", test.orderedBy ?? "—"],
          ["Collected", scanTime(test.at)],
          ["Visit", test.visit ?? "—"],
        ]}
      />
    </div>
  );
}
