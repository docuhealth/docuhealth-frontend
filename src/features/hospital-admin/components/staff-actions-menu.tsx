import {
  DotsThreeIcon,
  ShieldCheckIcon,
  ShieldSlashIcon,
  TrashIcon,
  UserCirclePlusIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { StaffMember } from "@/features/hospital-admin/api/schemas";
import {
  ActionMenuContent,
  ActionMenuItem,
} from "@/features/hospital-admin/components/action-menu";
import {
  StaffChangeDialogs,
  type StaffChangeStep,
} from "@/features/hospital-admin/components/staff-change-dialogs";

/**
 * The ⋯ menu on a staff row. Admins can only lose admin access (remove that before removing
 * them from the team); everyone else can be made admin, and removed from or added back to the
 * team. Each change asks first, then confirms with an Undo.
 */
export function StaffActionsMenu({ member }: { member: StaffMember }) {
  const [step, setStep] = useState<StaffChangeStep>();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`}>
            <DotsThreeIcon weight="bold" className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <ActionMenuContent>
          <ActionMenuItem asChild>
            <Link to="/hospital/admin/staff/$staffId" params={{ staffId: member.id }}>
              <UserIcon />
              View Profile
            </Link>
          </ActionMenuItem>

          {member.isAdmin ? (
            <ActionMenuItem onSelect={() => setStep("confirm-revoke-admin")}>
              <ShieldSlashIcon />
              Remove admin access
            </ActionMenuItem>
          ) : (
            <>
              <ActionMenuItem onSelect={() => setStep("confirm-grant-admin")}>
                <ShieldCheckIcon />
                Make Admin
              </ActionMenuItem>
              {member.status === "on_team" ? (
                <ActionMenuItem variant="destructive" onSelect={() => setStep("confirm-remove")}>
                  <TrashIcon />
                  Remove from team
                </ActionMenuItem>
              ) : (
                <ActionMenuItem onSelect={() => setStep("confirm-restore")}>
                  <UserCirclePlusIcon />
                  Add back to team
                </ActionMenuItem>
              )}
            </>
          )}
        </ActionMenuContent>
      </DropdownMenu>

      <StaffChangeDialogs member={member} step={step} onStepChange={setStep} />
    </>
  );
}
