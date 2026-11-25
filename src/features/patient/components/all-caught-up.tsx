import { CheckCircleIcon } from "@phosphor-icons/react";

/** "Needs your attention" with nothing in it. */
export function AllCaughtUp() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-16 text-center">
      <span className="grid size-16 place-content-center rounded-full bg-success-100">
        <CheckCircleIcon weight="fill" className="size-10 text-success-500" />
      </span>
      <p className="type-title-sm text-fg-heading">You’re all caught up</p>
      <p className="max-w-80 type-body-sm-regular text-fg-caption">
        New results, medications and bills will show up here as soon as a facility shares them.
      </p>
    </div>
  );
}
