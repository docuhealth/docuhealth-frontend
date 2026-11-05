import { ArrowClockwiseIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { hospitalAdminKeys, staffListQuery } from "@/features/hospital-admin/api/queries";
import {
  type StaffFilter,
  staffFilterLabels,
  type StaffMember,
} from "@/features/hospital-admin/api/schemas";
import { AddStaffDialog } from "@/features/hospital-admin/components/add-staff-dialog";
import { RemoveStaffFlow } from "@/features/hospital-admin/components/remove-staff-flow";
import { SearchField } from "@/components/dashboard/search-field";
import { StaffDirectory } from "@/features/hospital-admin/components/staff-directory";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

/**
 * The Staff Management page: search and filter the team, add staff, and remove several at
 * once by ticking them and pressing the trash button.
 */
export function StaffManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StaffFilter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const term = useDebouncedValue(search.trim());

  // Shares StaffDirectory's query, for the summary and the rows that are ticked.
  const { data, isFetching } = useQuery(staffListQuery(term, page, filter));
  // Who's in the "Remove staff?" flow while it's open.
  const [removing, setRemoving] = useState<StaffMember[]>();

  /** A different search, filter or page shows different rows, so start the ticks again. */
  function showRows(change: () => void) {
    change();
    setSelected(new Set());
  }

  /** Open the confirmation for everyone ticked who can go: on the team and not an admin. */
  function removeSelected() {
    const chosen = (data?.items ?? []).filter(({ id }) => selected.has(id));
    const removable = chosen.filter(({ isAdmin, status }) => !isAdmin && status === "on_team");

    if (removable.length === 0) {
      toast.info(
        chosen.some(({ isAdmin }) => isAdmin)
          ? "Admins stay on the team until their admin access is removed."
          : "Everyone selected is already removed.",
      );
      return;
    }
    if (removable.length < chosen.length) {
      toast.info("Admins and staff already removed aren’t included.");
    }
    setRemoving(removable);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">Staff Management</h1>
          <p className="type-body-sm-regular text-fg-caption">
            Manage hospital staff, access, and roles.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-4 sm:w-auto">
          <SearchField
            size="lg"
            label="Search staff"
            placeholder="Search names..."
            value={search}
            onChange={(value) =>
              showRows(() => {
                setSearch(value);
                setPage(1);
              })
            }
            className="sm:w-80"
          />
          <Select
            items={staffFilterLabels}
            value={filter}
            onValueChange={(value) => {
              if (!value) return;
              showRows(() => {
                setFilter(value);
                setPage(1);
              });
            }}
          >
            <SelectTrigger
              aria-label="Show"
              className="min-w-32 flex-1 gap-2 bg-card px-4 type-body-sm-medium text-fg-heading sm:flex-none [&_svg]:text-fg-heading"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(staffFilterLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="h-12 flex-1 gap-2 px-4 type-heading-sm has-data-[icon=inline-start]:pl-4 sm:flex-none"
            onClick={() => setAdding(true)}
          >
            <PlusIcon data-icon="inline-start" />
            Add Staff
          </Button>
        </div>
      </div>

      <section aria-label="Staff directory" className="@container rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          {selected.size > 0 ? (
            <div className="flex items-center gap-3">
              <p className="type-caption text-primary">{selected.size} selected</p>
              <Separator orientation="vertical" className="h-4! self-center! bg-divider" />
              <Button
                variant="ghost"
                size="sm"
                onClick={removeSelected}
                className="gap-1.5 px-1.5 type-caption text-error-500 hover:bg-error-100 hover:text-error-500"
              >
                <TrashIcon className="size-4" />
                Remove selected
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {data && (
                <p className="type-caption text-fg-caption">
                  {plural(data.summary.staff, "staff", "staff")} ·{" "}
                  {plural(data.summary.admins, "admin")}
                </p>
              )}
              <Separator orientation="vertical" className="h-4! self-center! bg-divider" />
              {/* Tick someone to remove them; this stays as a hint until then. */}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove selected from the team"
                disabled
                className="text-fg-caption"
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.staffLists() })
            }
            className="gap-1.5 type-caption text-fg-caption"
          >
            <ArrowClockwiseIcon className={cn("size-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <StaffDirectory
          search={term}
          filter={filter}
          page={page}
          onPageChange={(next) => showRows(() => setPage(next))}
          selection={{ selected, onChange: setSelected }}
        />
      </section>

      <AddStaffDialog open={adding} onOpenChange={setAdding} />
      {removing && (
        <RemoveStaffFlow
          people={removing}
          onRemoved={() => setSelected(new Set())}
          onClose={() => setRemoving(undefined)}
        />
      )}
    </div>
  );
}
