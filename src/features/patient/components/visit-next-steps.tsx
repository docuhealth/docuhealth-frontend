import { CalendarDotsIcon, TestTubeIcon } from "@phosphor-icons/react";
import type { VisitDetail } from "@/features/patient/api/pending";
import type { Appointment } from "@/features/patient/api/schemas";
import { RecordList } from "@/features/patient/components/patient-ui";
import { RelatedRow } from "@/features/patient/components/related-row";
import { formatDay } from "@/lib/format";

/** What comes after a visit: a follow-up (with its date when one is booked) and other steps. */
export function VisitNextSteps({
  steps,
  next,
}: {
  steps: VisitDetail["nextSteps"];
  /** The next appointment still to come, for a follow-up step's date. */
  next: Appointment | null;
}) {
  return (
    <RecordList label="Next steps">
      {steps.map((step) =>
        step.kind === "visit" ? (
          <RelatedRow
            key={`${step.kind}-${step.title}`}
            icon={<CalendarDotsIcon />}
            tone="warning"
            title={step.title}
            detail={next ? `${formatDay(new Date(next.at))} · Booked` : step.detail}
            to={next ? "/patient/appointments" : undefined}
          />
        ) : (
          <RelatedRow
            key={`${step.kind}-${step.title}`}
            icon={<TestTubeIcon />}
            title={step.title}
            detail={step.detail}
          />
        ),
      )}
    </RecordList>
  );
}
