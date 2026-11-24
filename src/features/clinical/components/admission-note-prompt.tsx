import { NotePencilIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { visitListQuery } from "@/features/clinical/api/queries";
import { AdmissionNoteDialog } from "@/features/clinical/components/note-dialogs";

type Patient = { hin: string; name: string };

/**
 * "This patient was newly admitted": the nursing admission note comes before any other nursing
 * work on an admission. Shown when a nurse opens such a patient, or when the API refuses one of
 * their tasks for it; "Write admission note" opens the note right here.
 *
 * `admissionId` is the admission when it's known (the patient's page). Task rows don't carry it
 * (TODO(api)), so on the Tasks page it's found among the admitted patients by name and HIN.
 * `patient` null closes it.
 */
export function AdmissionNotePrompt({
  patient,
  admissionId,
  onClose,
}: {
  patient: Patient | null;
  admissionId?: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [finding, setFinding] = useState(false);
  const [writing, setWriting] = useState<{ patient: Patient; admissionId: string } | null>(null);

  async function findAdmission(who: Patient) {
    if (admissionId) return admissionId;
    const admitted = await queryClient.fetchQuery(visitListQuery("inpatient", who.name, 1));
    return admitted.items.find(
      (visit) =>
        visit.kind === "admission" && visit.status === "active" && visit.patient.hin === who.hin,
    )?.id;
  }

  async function write() {
    if (!patient) return;
    setFinding(true);
    try {
      const id = await findAdmission(patient);
      if (id) {
        setWriting({ patient, admissionId: id });
        onClose();
      } else {
        toast.error(
          `We couldn’t find ${patient.name}’s admission. Open them from Patient Mgt. to write the note.`,
        );
      }
    } catch {
      toast.error("We couldn’t open the admission note. Try again in a moment.");
    } finally {
      setFinding(false);
    }
  }

  return (
    <>
      {patient && (
        <ConfirmDialog
          tone="brand"
          icon={<NotePencilIcon />}
          title="Add the nursing admission note"
          confirmLabel="Write admission note"
          onConfirm={() => void write()}
          pending={finding}
          onClose={onClose}
        >
          <DialogDescription className="type-body-sm-regular text-fg-body">
            {patient.name} was newly admitted to your ward. Write their admission note first: their
            nursing tasks open once it’s saved.
          </DialogDescription>
        </ConfirmDialog>
      )}
      <AdmissionNoteDialog
        open={!!writing}
        onOpenChange={(open) => !open && setWriting(null)}
        target={
          writing
            ? {
                hin: writing.patient.hin,
                admissionId: writing.admissionId,
                patientName: writing.patient.name,
              }
            : { hin: "", admissionId: "", patientName: "" }
        }
      />
    </>
  );
}
