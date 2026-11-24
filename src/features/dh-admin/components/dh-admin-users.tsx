import { ProhibitIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { SearchField } from "@/components/dashboard/search-field";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useSetUserActive } from "@/features/dh-admin/api/mutations";
import {
  hospitalUsersQuery,
  patientUsersQuery,
  USERS_PAGE_SIZE,
} from "@/features/dh-admin/api/queries";
import { type UserKind, userKindLabels } from "@/features/dh-admin/api/schemas";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";

/** A user the admin is switching on or off. */
type Switching = { kind: UserKind; id: string; name: string; active: boolean };

/**
 * Everyone on DocuHealth: individuals (patients) and hospitals, searchable. Each can be
 * deactivated (a hospital with its staff, an individual with their dependants) and back.
 */
export function DhAdminUsers() {
  const [kind, setKind] = useState<UserKind>("patient");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [switching, setSwitching] = useState<Switching | null>(null);
  const term = useDebouncedValue(search.trim());
  const patients = useQuery({ ...patientUsersQuery(term, kind === "patient" ? page : 1) });
  const hospitals = useQuery({ ...hospitalUsersQuery(term, kind === "hospital" ? page : 1) });
  const current = kind === "patient" ? patients : hospitals;

  const empty = current.isError
    ? "We couldn’t load the users. Try again in a moment."
    : current.data?.items.length === 0 &&
      (term ? "No one matches your search." : `No ${userKindLabels[kind].toLowerCase()} yet.`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Users</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Individuals and hospitals on DocuHealth.
        </p>
      </div>

      <section aria-label="Users" className="@container rounded-xl border bg-card p-4">
        <SearchField
          size="lg"
          label="Search users"
          placeholder={
            kind === "patient" ? "Search by name or email" : "Search by hospital name or email"
          }
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="@3xl:w-80"
        />
        <Tabs
          value={kind}
          onValueChange={(next) => {
            setKind(next as UserKind);
            setPage(1);
          }}
          className="mt-2 gap-0"
        >
          <CountTabsList className="-mx-4 w-auto px-4">
            <CountTab value="patient" count={patients.data?.total}>
              {userKindLabels.patient}
            </CountTab>
            <CountTab value="hospital" count={hospitals.data?.total}>
              {userKindLabels.hospital}
            </CountTab>
          </CountTabsList>
        </Tabs>

        {kind === "patient" ? (
          <DashboardTable
            className="type-body-sm-regular"
            columns={[
              { label: "Name", className: "type-body-sm-regular" },
              { label: "Phone", className: "w-40 type-body-sm-regular" },
              { label: "Date of birth", className: "w-36 type-body-sm-regular" },
              { label: "Status", className: "w-28 type-body-sm-regular" },
              { label: "Actions", hideLabel: true, className: "w-32" },
            ]}
            loading={!patients.data}
            empty={empty}
          >
            {(patients.data?.items ?? []).map((user) => (
              <TableRow key={user.hin}>
                <TableCell>
                  <PersonCell
                    name={user.name}
                    avatarUrl={null}
                    detail={[`HIN ${user.hin}`, user.email].filter(Boolean).join(" · ")}
                  />
                </TableCell>
                <TableCell>{user.phone ?? "—"}</TableCell>
                <TableCell>
                  {user.dateOfBirth ? formatDate(new Date(user.dateOfBirth)) : "—"}
                </TableCell>
                <TableCell>
                  <Status active={user.active} />
                </TableCell>
                <TableCell className="text-right">
                  <SwitchButton
                    name={user.name}
                    active={user.active}
                    onClick={() =>
                      setSwitching({ kind, id: user.hin, name: user.name, active: user.active })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        ) : (
          <DashboardTable
            className="type-body-sm-regular"
            columns={[
              { label: "Hospital", className: "type-body-sm-regular" },
              { label: "Address", className: "w-[24%] type-body-sm-regular" },
              { label: "Staff", className: "w-36 type-body-sm-regular" },
              { label: "Status", className: "w-28 type-body-sm-regular" },
              { label: "Actions", hideLabel: true, className: "w-32" },
            ]}
            loading={!hospitals.data}
            empty={empty}
          >
            {(hospitals.data?.items ?? []).map((hospital) => (
              <TableRow key={hospital.id}>
                <TableCell>
                  <PersonCell
                    name={hospital.name}
                    avatarUrl={hospital.imageUrl}
                    detail={hospital.email ?? "—"}
                  />
                </TableCell>
                <TableCell className="whitespace-normal">{hospital.address ?? "—"}</TableCell>
                <TableCell>
                  {hospital.doctors} {hospital.doctors === 1 ? "doctor" : "doctors"},{" "}
                  {hospital.otherStaff} other
                </TableCell>
                <TableCell>
                  <Status active={hospital.active} />
                </TableCell>
                <TableCell className="text-right">
                  <SwitchButton
                    name={hospital.name}
                    active={hospital.active}
                    onClick={() =>
                      setSwitching({
                        kind,
                        id: hospital.id,
                        name: hospital.name,
                        active: hospital.active,
                      })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        )}

        {current.data && current.data.total > 0 && (
          <TablePagination
            page={page}
            pageSize={USERS_PAGE_SIZE}
            total={current.data.total}
            onPageChange={setPage}
          />
        )}
      </section>

      {switching && <SwitchDialog user={switching} onClose={() => setSwitching(null)} />}
    </div>
  );
}

function Status({ active }: { active: boolean }) {
  return (
    <StatusPill tone={active ? "success" : "neutral"}>
      {active ? "Active" : "Deactivated"}
    </StatusPill>
  );
}

function SwitchButton({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={`${active ? "Deactivate" : "Activate"} ${name}`}
      onClick={onClick}
      className="bg-card type-caption-semibold font-sans text-fg-heading"
    >
      {active ? "Deactivate" : "Activate"}
    </Button>
  );
}

function SwitchDialog({ user, onClose }: { user: Switching; onClose: () => void }) {
  const setActive = useSetUserActive();
  const activating = !user.active;
  const who = user.kind === "hospital" ? "its staff" : "their dependants";

  return (
    <ConfirmDialog
      tone={activating ? "brand" : "danger"}
      icon={activating ? <CheckCircleIcon /> : <ProhibitIcon />}
      title={activating ? "Activate account" : "Deactivate account"}
      confirmLabel={activating ? "Activate" : "Deactivate"}
      pending={setActive.isPending}
      onClose={() => !setActive.isPending && onClose()}
      onConfirm={() =>
        setActive.mutate(
          { kind: user.kind, id: user.id, active: activating },
          {
            onSuccess: () => {
              toast.success(`${user.name} is ${activating ? "active again" : "deactivated"}.`);
              onClose();
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          },
        )
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        {activating
          ? `${user.name} and ${who} can sign in and use DocuHealth again.`
          : `${user.name} and ${who} won’t be able to sign in until you activate them again.`}
      </DialogDescription>
    </ConfirmDialog>
  );
}
