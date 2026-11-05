import {
  ShieldCheckIcon,
  ShieldSlashIcon,
  TrashIcon,
  UserCirclePlusIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { SuccessDialog } from "@/components/success-dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { useUpdateStaffMember } from "@/features/hospital-admin/api/mutations";
import {
  type StaffMember,
  type StaffMemberChange,
  staffRoles,
} from "@/features/hospital-admin/api/schemas";
import { ConfirmDialog } from "@/features/hospital-admin/components/confirm-dialog";
import { getErrorMessage } from "@/lib/api";

/**
 * Which step of changing someone's place on the team, or their admin access, is open. Open a
 * `confirm-…` step to start one; the dialogs move on to the result themselves.
 */
export type StaffChangeStep =
  | "confirm-remove"
  | "removed"
  | "confirm-restore"
  | "restored"
  | "confirm-revoke-admin"
  | "admin-revoked"
  | "confirm-grant-admin"
  | "admin-granted";

/**
 * The confirmations behind the ⋯ menu and the profile page's buttons: each change asks first,
 * then shows what happened with an Undo.
 */
export function StaffChangeDialogs({
  member,
  step,
  onStepChange,
}: {
  member: StaffMember;
  step: StaffChangeStep | undefined;
  onStepChange: (step: StaffChangeStep | undefined) => void;
}) {
  const update = useUpdateStaffMember();
  const close = () => onStepChange(undefined);

  /** Save `changes`, then either move to the `next` step or close with a `done` message. */
  function change(changes: StaffMemberChange, next: StaffChangeStep | { done: string }) {
    update.mutate(
      { id: member.id, change: changes },
      {
        onSuccess: () => {
          if (typeof next === "string") {
            onStepChange(next);
          } else {
            close();
            toast.success(next.done);
          }
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  const name = <strong className="font-medium text-fg-heading">{member.name}</strong>;

  return (
    <>
      {step === "confirm-remove" && (
        <ConfirmDialog
          tone="danger"
          icon={<TrashIcon />}
          title="Remove from team"
          confirmLabel="Remove"
          onConfirm={() => change({ status: "removed" }, "removed")}
          pending={update.isPending}
          onClose={close}
        >
          <DialogDescription className="type-body-sm-regular text-fg-body">
            Are you sure you want to remove {name} from your team? Removed team members won’t have
            access to their dashboard again unless they’re added back.
          </DialogDescription>
        </ConfirmDialog>
      )}
      {step === "confirm-revoke-admin" && (
        <ConfirmDialog
          tone="danger"
          icon={<ShieldSlashIcon />}
          title="Remove admin access"
          confirmLabel="Remove"
          onConfirm={() => change({ isAdmin: false }, "admin-revoked")}
          pending={update.isPending}
          onClose={close}
        >
          <DialogDescription className="type-body-sm-regular text-fg-body">
            {name} will keep their account and their role as {staffRoles[member.role].one}, but
            won’t be able to manage staff anymore.
          </DialogDescription>
        </ConfirmDialog>
      )}
      {step === "confirm-grant-admin" && (
        <ConfirmDialog
          tone="brand"
          icon={<ShieldCheckIcon />}
          title="Make admin"
          confirmLabel="Grant admin access"
          onConfirm={() => change({ isAdmin: true }, "admin-granted")}
          pending={update.isPending}
          onClose={close}
        >
          <DialogDescription className="type-body-sm-regular text-fg-body">
            Are you sure you want to make {name} an admin? They’ll be able to manage hospital staff,
            access, and other administrative settings.
          </DialogDescription>
        </ConfirmDialog>
      )}
      {step === "confirm-restore" && (
        <ConfirmDialog
          tone="brand"
          icon={<UserCirclePlusIcon />}
          title="Add back to team"
          confirmLabel="Add back to team"
          onConfirm={() => change({ status: "on_team" }, "restored")}
          pending={update.isPending}
          onClose={close}
        >
          <DialogDescription className="type-body-sm-regular text-fg-body">
            Are you sure you want to add {name} back to your team? They’ll regain access to the
            hospital’s DocuHealth workspace.
          </DialogDescription>
        </ConfirmDialog>
      )}

      <SuccessDialog
        open={step === "removed"}
        onOpenChange={(open) => !open && close()}
        title="Member removed!"
        description={
          <>{name} has been removed from your team and can no longer access their dashboard.</>
        }
        secondaryAction={{
          label: "Undo",
          onClick: () =>
            change({ status: "on_team" }, { done: `${member.name} is back on the team.` }),
        }}
        primaryAction={{ label: "Done", onClick: close }}
      />
      <SuccessDialog
        open={step === "admin-revoked"}
        onOpenChange={(open) => !open && close()}
        title="Access removed!"
        description={
          <>
            <strong className="font-medium text-fg-heading">{member.name}’s</strong> admin access
            has been removed. They can no longer manage hospital settings or access admin features.
          </>
        }
        secondaryAction={{
          label: "Undo",
          onClick: () => change({ isAdmin: true }, { done: `${member.name} is an admin again.` }),
        }}
        primaryAction={{ label: "Done", onClick: close }}
      />
      <SuccessDialog
        open={step === "admin-granted"}
        onOpenChange={(open) => !open && close()}
        title="Admin access granted!"
        description={
          <>
            {name} is now an admin and can manage hospital staff, access, and administrative
            settings.
          </>
        }
        secondaryAction={{
          label: "Undo",
          onClick: () =>
            change({ isAdmin: false }, { done: `${member.name} is no longer an admin.` }),
        }}
        primaryAction={{ label: "Done", onClick: close }}
      />
      <SuccessDialog
        open={step === "restored"}
        onOpenChange={(open) => !open && close()}
        title="Member added!"
        description={
          <>{name} has been added back to the team and can now access their dashboard.</>
        }
        secondaryAction={{
          label: "Undo",
          onClick: () =>
            change({ status: "removed" }, { done: `${member.name} is off the team again.` }),
        }}
        primaryAction={{ label: "Done", onClick: close }}
      />
    </>
  );
}
