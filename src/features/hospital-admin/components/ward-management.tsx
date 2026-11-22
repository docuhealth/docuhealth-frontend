import { zodResolver } from "@hookform/resolvers/zod";
import { BedIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDeleteWard, useSaveWard } from "@/features/hospital-admin/api/mutations";
import {
  WARDS_PAGE_SIZE,
  wardBedsQuery,
  wardListQuery,
} from "@/features/hospital-admin/api/queries";
import { type BedStatus, bedStatusLabels, type Ward } from "@/features/hospital-admin/api/schemas";
import {
  type WardFormInput,
  type WardFormValues,
  wardFormSchema,
} from "@/features/hospital-admin/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const bedTones = {
  available: "success",
  occupied: "error",
  requested: "warning",
} as const satisfies Record<BedStatus, string>;

/**
 * The hospital's wards, each with its beds' occupancy: create a ward, change one's name or
 * number of beds (and see its beds), or delete one with no patients in it.
 */
export function WardManagement() {
  const [page, setPage] = useState(1);
  // `null` creates a ward; a ward opens its Manage dialog.
  const [editing, setEditing] = useState<Ward | null | undefined>();
  const [deleting, setDeleting] = useState<Ward | null>(null);
  const { data, isError } = useQuery(wardListQuery(page));

  const empty = isError
    ? "We couldn’t load the wards. Try again in a moment."
    : data?.items.length === 0 && "No wards yet. Create one to start admitting patients.";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">Ward Management</h1>
          <p className="type-body-sm-regular text-fg-caption">
            The hospital’s wards and how full they are.
          </p>
        </div>
        <Button
          className="h-12 w-full gap-2 px-4 type-heading-sm has-data-[icon=inline-start]:pl-4 sm:w-auto"
          onClick={() => setEditing(null)}
        >
          <PlusIcon data-icon="inline-start" />
          Create ward
        </Button>
      </div>

      <section aria-label="Wards" className="rounded-xl border bg-card p-4">
        <p className="type-caption text-fg-caption">
          {data ? `${data.total} ${data.total === 1 ? "ward" : "wards"}` : "Loading wards…"}
        </p>
        {empty ? (
          <p className="py-10 text-center type-caption text-fg-caption">{empty}</p>
        ) : (
          <ul aria-label="Wards" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data?.items.map((ward) => (
              <WardCard
                key={ward.id}
                ward={ward}
                onManage={() => setEditing(ward)}
                onDelete={() => setDeleting(ward)}
              />
            ))}
          </ul>
        )}
        {data && data.total > WARDS_PAGE_SIZE && (
          <TablePagination
            page={page}
            pageSize={WARDS_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>

      <FormDialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
      >
        {editing !== undefined && <WardForm ward={editing} onSaved={() => setEditing(undefined)} />}
      </FormDialog>
      {deleting && <DeleteWardDialog ward={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

function WardCard({
  ward,
  onManage,
  onDelete,
}: {
  ward: Ward;
  onManage: () => void;
  onDelete: () => void;
}) {
  const full = ward.availableBeds === 0;
  const occupancy = ward.totalBeds ? ward.occupiedBeds / ward.totalBeds : 0;

  return (
    <li className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate type-h5 capitalize">{ward.name}</h2>
          <StatusPill tone={full ? "error" : "success"}>{full ? "Full" : "Open"}</StatusPill>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${ward.name}`}
          onClick={onDelete}
          className="text-fg-caption hover:bg-error-100 hover:text-error-500"
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5">
          <dt className="type-caption text-fg-caption">Available</dt>
          <dd className="type-heading-sm text-fg-heading">{ward.availableBeds}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="type-caption text-fg-caption">Total beds</dt>
          <dd className="type-heading-sm text-fg-heading">{ward.totalBeds}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-1.5">
        {/* The caption under it says the same in words. */}
        <div aria-hidden className="h-2 overflow-hidden rounded-full bg-line">
          <div
            className={cn("h-full rounded-full", occupancy > 0.9 ? "bg-error-500" : "bg-primary")}
            style={{ width: `${Math.round(occupancy * 100)}%` }}
          />
        </div>
        <span className="type-caption text-fg-caption">
          {ward.occupiedBeds} of {ward.totalBeds} beds taken
        </span>
      </div>

      <Button
        variant="outline"
        onClick={onManage}
        aria-label={`Manage ${ward.name}`}
        className="mt-auto bg-card type-body-sm-medium text-fg-heading"
      >
        Manage ward
      </Button>
    </li>
  );
}

/** Create a ward (`ward` null) or change one, beside a list of its beds. */
function WardForm({ ward, onSaved }: { ward: Ward | null; onSaved: () => void }) {
  const save = useSaveWard();
  const form = useForm<WardFormInput, unknown, WardFormValues>({
    resolver: zodResolver(wardFormSchema(ward?.occupiedBeds ?? 0)),
    defaultValues: { name: ward?.name ?? "", totalBeds: ward ? String(ward.totalBeds) : "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: WardFormValues) {
    save.mutate(
      { id: ward?.id, ...values },
      {
        onSuccess: () => {
          toast.success(ward ? `${values.name} is updated.` : `${values.name} is created.`);
          onSaved();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title={ward ? `Manage ${ward.name}` : "Create ward"}
        description={
          ward
            ? "Rename the ward or change how many beds it has."
            : "Name the ward and say how many beds it has."
        }
      />
      <FormDialogBody>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="wardName" className="gap-1">
            Ward name <RequiredMark />
          </FieldLabel>
          <Input
            id="wardName"
            autoComplete="off"
            placeholder="E.g Maternity ward"
            aria-required
            aria-invalid={!!errors.name}
            className="bg-card"
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.totalBeds}>
          <FieldLabel htmlFor="wardBeds" className="gap-1">
            Number of beds <RequiredMark />
          </FieldLabel>
          <Input
            id="wardBeds"
            type="number"
            inputMode="numeric"
            min={Math.max(1, ward?.occupiedBeds ?? 0)}
            placeholder="E.g 20"
            aria-required
            aria-invalid={!!errors.totalBeds}
            className="bg-card"
            {...form.register("totalBeds")}
          />
          <FieldError errors={[errors.totalBeds]} />
        </Field>
        {ward && <WardBeds ward={ward} />}
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={save.isPending} className="h-11 px-5 type-heading-sm">
          {ward ? "Save changes" : "Create ward"}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

/** The ward's beds, fetched fresh, each with whether it's free. */
function WardBeds({ ward }: { ward: Ward }) {
  const { data: beds, isError } = useQuery(wardBedsQuery(ward.id));
  const shown = beds ?? ward.beds;

  return (
    <section aria-label="Beds" className="flex flex-col gap-2">
      <h3 className="type-body-sm-medium text-fg-heading">Beds ({shown.length})</h3>
      {isError && !beds && (
        <p className="type-caption text-fg-caption">Showing the beds as they were last loaded.</p>
      )}
      {shown.length === 0 ? (
        <p className="type-caption text-fg-caption">This ward has no beds.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 min-[28rem]:grid-cols-2">
          {shown.map((bed) => (
            <li
              key={bed.id}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
            >
              <span className="flex items-center gap-1.5 type-body-sm-regular whitespace-nowrap text-fg-heading">
                <BedIcon className="size-4 text-fg-caption" />
                Bed {bed.number}
              </span>
              <StatusPill tone={bedTones[bed.status]}>{bedStatusLabels[bed.status]}</StatusPill>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DeleteWardDialog({ ward, onClose }: { ward: Ward; onClose: () => void }) {
  const remove = useDeleteWard();
  return (
    <ConfirmDialog
      tone="danger"
      icon={<TrashIcon />}
      title="Delete ward"
      confirmLabel="Delete"
      pending={remove.isPending}
      onClose={() => !remove.isPending && onClose()}
      onConfirm={() =>
        remove.mutate(ward.id, {
          onSuccess: () => {
            toast.success(`${ward.name} is deleted.`);
            onClose();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Delete {ward.name} and its {ward.totalBeds} beds? This can’t be undone. A ward with patients
        in it can’t be deleted.
      </DialogDescription>
    </ConfirmDialog>
  );
}
