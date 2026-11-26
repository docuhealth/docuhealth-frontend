import { useQuery } from "@tanstack/react-query";
import { StatusPill } from "@/components/dashboard/status-pill";
import { CardSkeleton } from "@/components/dashboard/skeletons";
import { EmptyState } from "@/components/empty-state";
import { recordEventQuery } from "@/features/clinical/api/queries";
import { RecordFields } from "@/features/clinical/components/record-fields";
import { getErrorMessage } from "@/lib/api";

/**
 * One timeline record in full, fetched from its event: a typed record in titled parts (the order,
 * each test or drug), anything else as the fields it was sent with.
 */
export function RecordEventDetails({ id, type }: { id: string; type: string }) {
  const { data, error } = useQuery(recordEventQuery(id, type));

  if (error) {
    return (
      <EmptyState
        compact
        title="We couldn’t load this record."
        description={getErrorMessage(error)}
      />
    );
  }
  if (!data) return <CardSkeleton lines={5} />;

  return (
    <div className="flex flex-col gap-5">
      {data.sections.map((section, index) => (
        <section
          key={`${section.title ?? "record"}-${index}`}
          aria-label={section.title ?? "Record"}
          className="flex flex-col gap-2"
        >
          {(section.title || section.status) && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              {section.title && (
                <h3 className="type-body-sm-tight-semibold text-fg-heading">{section.title}</h3>
              )}
              {section.status && (
                <StatusPill tone={section.status.tone}>{section.status.label}</StatusPill>
              )}
            </div>
          )}
          {section.fields.length === 0 ? (
            <p className="type-body-sm-regular text-fg-caption">{section.empty}</p>
          ) : (
            <RecordFields fields={section.fields} />
          )}
        </section>
      ))}
    </div>
  );
}
