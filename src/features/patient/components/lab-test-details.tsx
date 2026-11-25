import { FlaskIcon } from "@phosphor-icons/react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { LabTestAmended } from "@/features/patient/components/lab-test-amended";
import { LabTestHeader } from "@/features/patient/components/lab-test-header";
import { LabTestPanel } from "@/features/patient/components/lab-test-panel";
import { LabTestProgress } from "@/features/patient/components/lab-test-progress";
import { LabTestQualitative } from "@/features/patient/components/lab-test-qualitative";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { useTestResults } from "@/features/patient/lib/use-test-results";

const layouts = {
  processing: LabTestProgress,
  amended: LabTestAmended,
  qualitative: LabTestQualitative,
  panel: LabTestPanel,
};

/** One lab test: its progress, its values, a word result or a correction, by what it has. */
export function LabTestDetails({ resultId }: { resultId: string }) {
  const { tests, isError } = useTestResults();
  const test = tests?.find((candidate) => candidate.id === resultId);
  const Layout = test ? layouts[test.layout] : null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeading
        title={test?.name ?? "Lab test"}
        back={{ to: "/patient/health/results", label: "Back to Test results" }}
      />
      {!tests && !isError ? (
        <ListSkeleton />
      ) : !test || !Layout ? (
        <PatientEmpty
          icon={<FlaskIcon />}
          title="Test not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <LabTestHeader test={test} />
          <Layout test={test} />
        </>
      )}
    </div>
  );
}
