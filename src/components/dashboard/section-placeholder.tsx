import { HammerIcon } from "@phosphor-icons/react";

/** Stands in for a dashboard section that hasn't been built yet. */
export function SectionPlaceholder({ title }: { title: string }) {
  return (
    <>
      <title>{`${title} · DocuHealth`}</title>
      <div className="flex flex-col gap-6">
        <h1 className="type-h3">{title}</h1>
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-16 text-center">
          <div className="grid size-14 place-content-center rounded-2xl bg-primary/10 text-primary">
            <HammerIcon className="size-6" />
          </div>
          <p className="type-body text-fg-heading">This section is on its way</p>
          <p className="type-body-sm-regular text-muted-foreground">
            It will appear here once its design is ready.
          </p>
        </div>
      </div>
    </>
  );
}
