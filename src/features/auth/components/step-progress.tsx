/** "Step x of y" with a segmented bar, shown above multi-step sign-up forms. */
export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between type-body-sm-tight text-muted-foreground">
        <span>
          Step {step} of {total}
        </span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div aria-hidden className="flex gap-2">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={
              index < step
                ? "h-1.5 flex-1 rounded-full bg-primary"
                : "h-1.5 flex-1 rounded-full bg-line"
            }
          />
        ))}
      </div>
    </div>
  );
}
