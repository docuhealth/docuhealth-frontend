import { FlaskIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { DateDivider } from "@/features/patient/components/date-divider";
import { FacilityFilter } from "@/features/patient/components/facility-filter";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { RecordList } from "@/features/patient/components/patient-ui";
import { TestResultRow } from "@/features/patient/components/test-result-row";
import { notYet } from "@/features/patient/lib/not-yet";
import { groupTestsByDay } from "@/features/patient/lib/results";
import { useTestResults } from "@/features/patient/lib/use-test-results";
import { plural } from "@/lib/format";

/** The patient's lab tests by day, filtered by facility, each with its status or result. */
export function TestResultsPage() {
  const { tests, isError } = useTestResults();
  const [facility, setFacility] = useState<string | null>(null);
  const facilities = [
    ...new Set((tests ?? []).map((test) => test.facility).filter((name) => name != null)),
  ];
  const shown = (tests ?? []).filter((test) => !facility || test.facility === facility);
  const fresh = (tests ?? []).filter((test) => test.isNew).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        title="Test results"
        back={{ to: "/patient/health", label: "Back to Health" }}
        subtitle={
          !tests
            ? null
            : tests.length
              ? [plural(tests.length, "result"), fresh ? `${fresh} new` : null]
                  .filter(Boolean)
                  .join(" · ")
              : "No results yet"
        }
      />
      <div className="flex items-start justify-between gap-3">
        <FacilityFilter facilities={facilities} value={facility} onChange={setFacility} />
        {/* TODO(api): no other ways to filter results yet. */}
        <button
          type="button"
          aria-label="More filters"
          onClick={notYet("More filters")}
          className="grid size-9 shrink-0 place-content-center rounded-full bg-card text-fg-heading ring-1 ring-line hover:ring-fg-caption/40"
        >
          <FunnelSimpleIcon className="size-4" />
        </button>
      </div>
      {!tests && !isError ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <PatientEmpty
          icon={<FlaskIcon />}
          title="No test results yet"
          description="Your lab test results will appear here once they’re available."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {groupTestsByDay(shown).map((group) => (
            <section key={group.label} aria-label={group.label} className="flex flex-col gap-3">
              <DateDivider>{group.label}</DateDivider>
              <RecordList label={`Tests on ${group.label}`}>
                {group.tests.map((test) => (
                  <TestResultRow key={test.id} test={test} />
                ))}
              </RecordList>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
