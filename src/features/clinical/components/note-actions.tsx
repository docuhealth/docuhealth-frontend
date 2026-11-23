import { CaretDownIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasAdmissionNoteQuery } from "@/features/clinical/api/notes";
import type { Visit } from "@/features/clinical/api/schemas";
import { HandoverDialog } from "@/features/clinical/components/handover-dialog";
import {
  AdmissionNoteDialog,
  RecordVitalsDialog,
  TextNoteDialog,
} from "@/features/clinical/components/note-dialogs";

type Dialog = "admission" | "case" | "care-plan" | "progress" | "vitals" | "handover";

const outline = "h-12 gap-2 bg-card px-5 type-body-sm-medium";
const primary = "h-12 px-5 type-heading-sm";

/** Whether the nurse has written this admission's admission note; undefined while checking. */
function useHasAdmissionNote(visit: Visit) {
  const isAdmission = visit.kind === "admission";
  const { data, isError } = useQuery({
    ...hasAdmissionNoteQuery(visit.patient.hin, visit.id, visit.startedAt),
    enabled: isAdmission,
  });
  // When the notes can't be read, nothing is held back.
  return isAdmission && !isError ? data : true;
}

/**
 * What a doctor or nurse writes on an active admission.
 * - Nurse: the admission note first (nothing else until it's written), then vitals, case notes,
 *   care plans, and the handover.
 * - Doctor: progress notes and the handover.
 */
export function NoteActions({
  staff: role,
  visit,
  myId,
}: {
  staff: "doctor" | "nurse";
  visit: Visit;
  myId: string;
}) {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const hasAdmissionNote = useHasAdmissionNote(visit);
  if (visit.kind !== "admission" || visit.status !== "active") return null;

  const target = { hin: visit.patient.hin, admissionId: visit.id, patientName: visit.patient.name };
  const toggle = (which: Dialog) => (open: boolean) => setDialog(open ? which : null);
  const menu = (items: [Dialog, string][]): ReactNode => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={outline}>
          Notes
          <CaretDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map(([which, label]) => (
          <DropdownMenuItem key={which} onSelect={() => setDialog(which)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {role === "doctor" ? (
        menu([
          ["progress", "Progress note"],
          ["handover", "Hand over"],
        ])
      ) : hasAdmissionNote === false ? (
        <Button className={primary} onClick={() => setDialog("admission")}>
          Write admission note
        </Button>
      ) : hasAdmissionNote ? (
        <>
          {menu([
            ["case", "Case note"],
            ["care-plan", "Care plan"],
          ])}
          <Button variant="outline" className={outline} onClick={() => setDialog("handover")}>
            Hand over
          </Button>
          <Button className={primary} onClick={() => setDialog("vitals")}>
            Record vitals
          </Button>
        </>
      ) : null}

      <AdmissionNoteDialog
        open={dialog === "admission"}
        onOpenChange={toggle("admission")}
        target={target}
      />
      <RecordVitalsDialog
        open={dialog === "vitals"}
        onOpenChange={toggle("vitals")}
        target={target}
      />
      {(["case", "care-plan", "progress"] as const).map((kind) => (
        <TextNoteDialog
          key={kind}
          kind={kind}
          open={dialog === kind}
          onOpenChange={toggle(kind)}
          target={target}
        />
      ))}
      <HandoverDialog
        staff={role}
        open={dialog === "handover"}
        onOpenChange={toggle("handover")}
        hin={visit.patient.hin}
        patientName={visit.patient.name}
        myId={myId}
      />
    </>
  );
}

/**
 * The nurse's work on a new admission waits for its admission note: until it's written, this
 * shows why instead of `children`.
 */
export function AdmissionNoteGate({ visit, children }: { visit: Visit; children: ReactNode }) {
  const hasAdmissionNote = useHasAdmissionNote(visit);
  if (hasAdmissionNote || visit.status !== "active") return children;
  return (
    <p className="rounded-xl border bg-card px-4 py-10 text-center type-body-sm-regular text-fg-caption">
      {hasAdmissionNote === false
        ? "Write the admission note first: the nursing tasks open once it’s saved."
        : "Loading…"}
    </p>
  );
}
