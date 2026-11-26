/** A record's fields as label and value rows, ruled off from each other. */
export function RecordFields({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-col divide-y rounded-lg border">
      {fields.map(({ label, value }, index) => (
        <div
          key={`${label}-${index}`}
          className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3"
        >
          <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
          <dd className="type-body-sm-regular break-words whitespace-pre-line text-fg-heading">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
