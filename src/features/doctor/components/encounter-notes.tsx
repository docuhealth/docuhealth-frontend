import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TablePagination } from "@/components/dashboard/table-pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useAddToEncounterNote } from "@/features/doctor/api/mutations";
import { encounterNotesQuery, NOTES_PAGE_SIZE } from "@/features/doctor/api/queries";
import type { EncounterNote } from "@/features/doctor/api/schemas";
import { type AdditionalNoteValues, additionalNoteSchema } from "@/features/doctor/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { formatDateCommaTime, formatDayAndTime } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

/**
 * The patient's encounter (SOAP) notes, newest first; each opens to the whole note and any
 * notes added since, and can be added to.
 */
export function EncounterNotes({ hin }: { hin: string }) {
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(encounterNotesQuery(hin, page));
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());

  const empty = isError
    ? "We couldn’t load the encounter notes. Try again in a moment."
    : data?.items.length === 0 && "No encounter notes yet.";

  return (
    <section aria-label="Encounter notes" className="rounded-xl border bg-card px-4 py-2">
      {empty || !data ? (
        <div>
          {empty ? <EmptyState compact description={empty} /> : <ListSkeleton className="py-4" />}
        </div>
      ) : (
        <Accordion type="multiple" className="flex flex-col">
          {data.items.map((note) => {
            const { day, time } = formatDayAndTime(new Date(note.at), now);
            return (
              <AccordionItem key={note.id} value={note.id}>
                <AccordionTrigger className="gap-3 py-3.5 hover:no-underline">
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                    <span className="type-body-sm-medium text-fg-heading">
                      {note.primaryDiagnosis}
                    </span>
                    <span className="type-caption text-fg-caption">
                      {[note.chiefComplaint, note.by, `${day}, ${time}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <NoteBody note={note} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
      {data && data.total > NOTES_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={NOTES_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}

function NoteBody({ note }: { note: EncounterNote }) {
  const rows = [
    { label: "Chief complaint", text: note.chiefComplaint },
    ...note.sections,
    { label: "Primary diagnosis", text: note.primaryDiagnosis },
    ...(note.nextAppointment
      ? [{ label: "Next appointment", text: formatDateCommaTime(new Date(note.nextAppointment)) }]
      : []),
    { label: "Shared with nurses", text: note.sharedWithNurses ? "Yes" : "No" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col divide-y rounded-lg border">
        {rows.map(({ label, text }) => (
          <div key={label} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3">
            <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
            <dd className="type-body-sm-regular break-words whitespace-pre-line text-fg-heading">
              {text}
            </dd>
          </div>
        ))}
      </dl>
      {note.additionalNotes.length > 0 && (
        <section aria-label="Added notes" className="flex flex-col gap-2">
          <h4 className="type-body-sm-medium text-fg-heading">Added notes</h4>
          <ul className="flex flex-col gap-2">
            {note.additionalNotes.map((added) => (
              <li key={added.id} className="rounded-lg bg-line px-4 py-2.5">
                <p className="type-body-sm-regular whitespace-pre-line text-fg-heading">
                  {added.note}
                </p>
                <p className="type-caption text-fg-caption">
                  {formatDateCommaTime(new Date(added.at))}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <AddNoteForm note={note} />
    </div>
  );
}

function AddNoteForm({ note }: { note: EncounterNote }) {
  const add = useAddToEncounterNote();
  const form = useForm<AdditionalNoteValues>({
    resolver: zodResolver(additionalNoteSchema),
    defaultValues: { note: "" },
  });
  const { errors } = form.formState;
  const id = `addNote-${note.id}`;

  function onSubmit(values: AdditionalNoteValues) {
    add.mutate(
      { noteId: note.id, note: values.note },
      {
        onSuccess: () => {
          toast.success("Your note is added.");
          form.reset();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
      <Field data-invalid={!!errors.note}>
        <FieldLabel htmlFor={id}>Add a note</FieldLabel>
        <Textarea
          id={id}
          placeholder="e.g. Results reviewed; plan unchanged"
          aria-invalid={!!errors.note}
          className="min-h-20 bg-card"
          {...form.register("note")}
        />
        <FieldError errors={[errors.note]} />
      </Field>
      <Button
        type="submit"
        variant="outline"
        loading={add.isPending}
        className="self-start bg-card type-body-sm-medium"
      >
        Add note
      </Button>
    </form>
  );
}
