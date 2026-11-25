import { FlaskIcon, HospitalIcon } from "@phosphor-icons/react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { DetailRows } from "@/features/patient/components/patient-ui";
import { ResultRangeCard } from "@/features/patient/components/result-range-card";
import { ResultShareButton } from "@/features/patient/components/result-share-button";
import { ResultTrendCard } from "@/features/patient/components/result-trend-card";
import { Tag } from "@/features/patient/components/tag";
import { singleValue, specimenLine, statusTag, valueTrend } from "@/features/patient/lib/results";
import { useTestResults } from "@/features/patient/lib/use-test-results";
import { formatDateCommaTime, formatDay } from "@/lib/format";

/** One value of a test: the reading, where it sits in its range, its trend and the lab's details. */
export function ResultValueDetails({ resultId, valueId }: { resultId: string; valueId: string }) {
  const { tests, isError } = useTestResults();
  const test = tests?.find((candidate) => candidate.id === resultId);
  const value = test?.values.find((candidate) => candidate.id === valueId);
  // A test with one value opens straight to it, so its way back is the list.
  const back =
    test && !singleValue(test)
      ? {
          to: "/patient/health/results/$resultId" as const,
          params: { resultId: test.id },
          label: `Back to ${test.name}`,
        }
      : { to: "/patient/health/results" as const, label: "Back to Test results" };
  const resultedAt = test?.report?.resultedAt;

  return (
    <div className="flex flex-col gap-5">
      <PageHeading title={value?.name ?? "Test result"} back={back} />
      {!tests && !isError ? (
        <ListSkeleton />
      ) : !test || !value ? (
        <PatientEmpty
          icon={<FlaskIcon />}
          title="Result not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="type-title text-fg-heading">{value.name}</h1>
                <Tag tone={statusTag(test).tone}>{statusTag(test).label}</Tag>
              </div>
              <p className="type-accent-h1 text-fg-heading">
                {value.value}{" "}
                {value.unit && <span className="type-accent-h4 text-fg-caption">{value.unit}</span>}
              </p>
              <p className="flex items-center gap-1.5 type-caption text-fg-caption">
                <HospitalIcon aria-hidden className="size-3.5" />
                {[formatDay(new Date(test.at)), test.laboratory].filter(Boolean).join(" · ")}
              </p>
            </div>
            <ResultShareButton />
          </div>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
            <div className="flex flex-col gap-4">
              <ResultRangeCard value={value} />
              {valueTrend(value, test, "all").length > 1 && (
                <ResultTrendCard value={value} test={test} />
              )}
            </div>
            <DetailRows
              rows={[
                ["Specimen", specimenLine(test) ?? "—"],
                ["Resulted", resultedAt ? formatDateCommaTime(new Date(resultedAt)) : "—"],
                ["Laboratory", test.laboratory ?? "—"],
                ["Ordered by", test.orderedBy ?? "—"],
                ["Visit", test.visit ?? "—"],
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
