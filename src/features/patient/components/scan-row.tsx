import { RecordList, RecordRow } from "@/features/patient/components/patient-ui";
import { Tag } from "@/features/patient/components/tag";
import { type ScanView, scanRowDetail, scanTag } from "@/features/patient/lib/scans";

/** One scan in the list, on its own card: name, where and what's in it, its tag. */
export function ScanRow({ scan }: { scan: ScanView }) {
  const tag = scanTag(scan);
  return (
    <RecordList label={scan.name}>
      <RecordRow
        title={scan.name}
        meta={scanRowDetail(scan)}
        status={<Tag tone={tag.tone}>{tag.label}</Tag>}
        to="/patient/health/scans/$scanId"
        params={{ scanId: scan.id }}
      />
    </RecordList>
  );
}
