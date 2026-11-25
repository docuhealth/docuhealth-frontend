import { RecordRow } from "@/features/patient/components/patient-ui";
import { Tag } from "@/features/patient/components/tag";
import { type LabTest, listTag, singleValue, testRowDetail } from "@/features/patient/lib/results";

/** One test in the list: its name, what came back and where, its tag. One value opens straight to it. */
export function TestResultRow({ test }: { test: LabTest }) {
  const tag = listTag(test);
  const single = singleValue(test);
  return single ? (
    <RecordRow
      title={test.name}
      meta={testRowDetail(test)}
      status={<Tag tone={tag.tone}>{tag.label}</Tag>}
      to="/patient/health/results/$resultId/$valueId"
      params={{ resultId: test.id, valueId: single.id }}
    />
  ) : (
    <RecordRow
      title={test.name}
      meta={testRowDetail(test)}
      status={<Tag tone={tag.tone}>{tag.label}</Tag>}
      to="/patient/health/results/$resultId"
      params={{ resultId: test.id }}
    />
  );
}
