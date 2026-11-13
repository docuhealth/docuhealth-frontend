import { TrashIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { useSetStaffStatus } from "@/features/hospital-admin/api/mutations";
import { type StaffMember, staffRoles } from "@/features/hospital-admin/api/schemas";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { getErrorMessage } from "@/lib/api";

type Step = "confirm" | "kept-everyone" | "removed";

/**
 * Removing several staff at once: confirm who loses access (✕ keeps someone), then a
 * confirmation that can be undone. Keeping everyone ends on "Everyone is staying" instead.
 * Mount it when the flow starts; `onClose` ends it.
 */
export function RemoveStaffFlow({
  people,
  onRemoved,
  onClose,
}: {
  /** Everyone selected who can be removed (on the team, not an admin). */
  people: StaffMember[];
  /** After the removal is saved, e.g. to clear the selection. */
  onRemoved: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("confirm");
  const [kept, setKept] = useState<ReadonlySet<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const setStatus = useSetStaffStatus();

  const leaving = people.filter(({ id }) => !kept.has(id));
  const staffCount = (count: number) => `${count} staff`;

  function keep(id: string) {
    const next = new Set(kept).add(id);
    setKept(next);
    if (next.size === people.length) setStep("kept-everyone");
  }

  function remove() {
    const ids = leaving.map(({ id }) => id);
    setStatus.mutate(
      { ids, status: "removed" },
      {
        onSuccess: () => {
          setRemovedIds(ids);
          setStep("removed");
          onRemoved();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  function undoRemoval() {
    setStatus.mutate(
      { ids: removedIds, status: "on_team" },
      {
        onSuccess: () => {
          toast.success(`${staffCount(removedIds.length)} back on the team.`);
          onClose();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  if (step === "kept-everyone") {
    return (
      <SuccessDialog
        open
        onOpenChange={(open) => !open && onClose()}
        header={{ icon: <TrashIcon />, title: "No staff selected" }}
        title="Everyone is staying"
        description={`You’ve kept ${people.length === 1 ? "1 person" : `all ${people.length} people`}, so no one will be removed.`}
        secondaryAction={{
          label: "Undo",
          onClick: () => {
            setKept(new Set());
            setStep("confirm");
          },
        }}
        primaryAction={{ label: "Close", onClick: onClose }}
      />
    );
  }

  if (step === "removed") {
    return (
      <SuccessDialog
        open
        onOpenChange={(open) => !open && onClose()}
        title={`${staffCount(removedIds.length)} removed!`}
        description={`${removedIds.length === 1 ? "The member’s" : "Their"} access to DocuHealth has been removed. Their patient records remain in the system, and your hospital data stays intact.`}
        secondaryAction={{ label: "Undo", onClick: undoRemoval }}
        primaryAction={{ label: "Done", onClick: onClose }}
      />
    );
  }

  return (
    <ConfirmDialog
      tone="danger"
      icon={<TrashIcon />}
      size="lg"
      title={`Remove ${staffCount(leaving.length)}?`}
      confirmLabel={`Remove ${staffCount(leaving.length)}`}
      onConfirm={remove}
      pending={setStatus.isPending}
      onClose={onClose}
    >
      <DialogDescription className="type-body-sm-regular text-fg-body">
        They’ll lose access to DocuHealth straight away. Patient records they created will stay in
        the system, and hospital data won’t change.
      </DialogDescription>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="type-body-sm text-fg-heading">
            {leaving.length} {leaving.length === 1 ? "person" : "people"} will lose access
          </p>
          <p className="flex items-center gap-1 type-caption text-fg-caption">
            Select <XIcon aria-label="✕" className="size-3.5" /> to keep someone
          </p>
        </div>
        <ul aria-label="Staff to remove" className="divide-y rounded-lg border">
          {leaving.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-3 py-3">
              <PersonAvatar name={member.name} src={member.avatarUrl} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-body-sm-regular text-fg-heading">{member.name}</span>
                <span className="truncate type-caption text-fg-caption">
                  {staffRoles[member.role].one}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Keep ${member.name}`}
                onClick={() => keep(member.id)}
                className="text-fg-body"
              >
                <XIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </ConfirmDialog>
  );
}
