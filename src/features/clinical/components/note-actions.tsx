import { CaretDownIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasAdmissionNoteQuery } from "@/features/clinical/api/notes";
import type { Visit } from "@/features/clinical/api/schemas";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { EmptyState } from "@/components/empty-state";
import { AdmissionNotePrompt } from "@/features/clinical/components/admission-note-prompt";
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
  const isOpenAdmission = visit.kind === "admission" && visit.status === "active";
  // As in v1: a nurse who opens a newly admitted patient is asked for the admission note once.
  const [prompting, setPrompting] = useState(false);
  const prompted = useRef(false);
  useEffect(() => {
    if (role !== "nurse" || !isOpenAdmission || hasAdmissionNote !== false || prompted.current) {
      return;
    }
    prompted.current = true;
    setPrompting(true);
  }, [role, isOpenAdmission, hasAdmissionNote]);
  if (!isOpenAdmission) return null;

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

      <AdmissionNotePrompt
        patient={prompting ? { hin: visit.patient.hin, name: visit.patient.name } : null}
        admissionId={visit.id}
        onClose={() => setPrompting(false)}
      />
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
 * shows why instead of `children`, with the button to write it.
 */
export function AdmissionNoteGate({ visit, children }: { visit: Visit; children: ReactNode }) {
  const hasAdmissionNote = useHasAdmissionNote(visit);
  const [writing, setWriting] = useState(false);
  // Mounted whatever the gate shows: saving the note opens the gate, and the form must still be
  // there to finish (confirm, clear its draft) after that.
  const noteDialog = (
    <AdmissionNoteDialog
      open={writing}
      onOpenChange={setWriting}
      target={{ hin: visit.patient.hin, admissionId: visit.id, patientName: visit.patient.name }}
    />
  );
  if (hasAdmissionNote || visit.status !== "active") {
    return (
      <>
        {children}
        {noteDialog}
      </>
    );
  }
  return (
    <div className="rounded-xl border bg-card px-4">
      {hasAdmissionNote === false ? (
        <EmptyState
          title="Write the admission note first"
          description="The nursing tasks open once it’s saved."
          action={
            <Button className={primary} onClick={() => setWriting(true)}>
              Write admission note
            </Button>
          }
        />
      ) : (
        <ListSkeleton className="py-4" />
      )}
      {noteDialog}
    </div>
  );
}
