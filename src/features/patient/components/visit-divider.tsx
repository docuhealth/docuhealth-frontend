/** A centred label between two rules, heading a group of the Visits list ("UPCOMING"). */
export function VisitDivider({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3" role="presentation">
      <span className="h-px flex-1 bg-line" />
      <span className="type-caption-medium tracking-wide text-fg-caption uppercase">
        {children}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
