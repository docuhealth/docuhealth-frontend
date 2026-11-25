/** A day's label centred on a line, between groups of a dated list: "TODAY", "25 SEP, 2026". */
export function DateDivider({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span className="type-caption-semibold text-fg-caption uppercase">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}
