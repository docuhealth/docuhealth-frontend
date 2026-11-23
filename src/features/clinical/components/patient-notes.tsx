import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { TablePagination } from "@/components/dashboard/table-pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NOTES_PAGE_SIZE,
  type NoteKind,
  noteKindLabels,
  patientNotesQuery,
} from "@/features/clinical/api/notes";
import { formatDayAndTime } from "@/lib/format";

/** Why a kind of note couldn't be loaded, in words. */
function failure(error: unknown) {
  if (isAxiosError(error) && error.response?.status === 403) {
    // TODO(api): doctors can't read care plans or the vitals history yet.
    return "You can’t see these notes yet.";
  }
  if (isAxiosError(error) && (error.response?.status ?? 0) >= 500) {
    // TODO(api): the doctors' shared notes fail on staging.
    return "These notes aren’t available right now. Try again later.";
  }
  return "We couldn’t load these notes. Try again in a moment.";
}

/**
 * The patient's notes of one kind at a time (`kinds` are the ones this dashboard offers), newest
 * first; each opens to show what was written.
 */
export function PatientNotes({ hin, kinds }: { hin: string; kinds: readonly NoteKind[] }) {
  const [kind, setKind] = useState<NoteKind>(kinds[0] ?? "admission");
  const [page, setPage] = useState(1);
  const { data, error } = useQuery(patientNotesQuery(hin, kind, page));
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());
  const options = Object.fromEntries(
    kinds.map((value) => [value, noteKindLabels[value]]),
  ) as Record<NoteKind, string>;

  const empty = error ? failure(error) : data?.items.length === 0 && "Nothing written here yet.";

  return (
    <section aria-label="Notes" className="rounded-xl border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-3 pb-2">
        <h3 className="type-h5">{noteKindLabels[kind]}</h3>
        {kinds.length > 1 && (
          <FilterSelect
            label="Notes"
            size="sm"
            value={kind}
            options={options}
            onChange={(next) => {
              setKind(next);
              setPage(1);
            }}
          />
        )}
      </div>
      {empty || !data ? (
        <p className="py-10 text-center type-body-sm-regular text-fg-caption">
          {empty || "Loading…"}
        </p>
      ) : (
        <Accordion type="multiple" className="flex flex-col border-t">
          {data.items.map((note) => {
            const { day, time } = formatDayAndTime(new Date(note.at), now);
            return (
              <AccordionItem key={note.id} value={note.id}>
                <AccordionTrigger className="gap-3 py-3 hover:no-underline">
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                    <span className="line-clamp-1 type-body-sm-medium text-fg-heading">
                      {note.title}
                    </span>
                    <span className="type-caption text-fg-caption">
                      {[note.by, `${day}, ${time}`].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {note.sections.length === 0 ? (
                    <p className="pb-2 type-body-sm-regular text-fg-caption">Nothing written.</p>
                  ) : (
                    <dl className="flex flex-col divide-y rounded-lg border">
                      {note.sections.map(({ label, text }) => (
                        <div
                          key={label}
                          className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3"
                        >
                          <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
                          <dd className="type-body-sm-regular break-words whitespace-pre-line text-fg-heading">
                            {text}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
      {data && !error && data.total > NOTES_PAGE_SIZE && (
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
