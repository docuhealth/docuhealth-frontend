import { Progress } from "@/components/ui/progress";
import { type DashboardOverview, staffRoles } from "@/features/hospital-admin/api/schemas";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

/** How many staff hold each role, with each role's share of the total as a bar. */
export function StaffByRoleCard({ roles }: { roles: DashboardOverview["staffByRole"] }) {
  const total = roles.reduce((sum, { count }) => sum + count, 0);

  return (
    <DashboardCard title="Staff by role">
      <ul className="mt-5 flex flex-col gap-6 border-t pt-6">
        {roles.map(({ role, count }) => {
          const label = staffRoles[role].many;
          return (
            <li key={role} className="flex flex-col gap-3">
              <div className="flex justify-between gap-3">
                <span className="type-body-sm-tight text-fg-body">{label}</span>
                <span className="type-body-sm-tight-semibold text-fg-heading">{count}</span>
              </div>
              <Progress
                aria-label={label}
                value={total ? (count / total) * 100 : 0}
                className="h-2 rounded-lg bg-line *:data-[slot=progress-indicator]:rounded-lg *:data-[slot=progress-indicator]:bg-success-500"
              />
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
