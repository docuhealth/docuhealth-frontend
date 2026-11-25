import type { ReactNode } from "react";

/** A page's "nothing here": a round icon, a title and a line. */
export function PatientEmpty({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-16 place-content-center rounded-full bg-line text-fg-caption [&_svg]:size-7">
        {icon}
      </span>
      <p className="type-title-sm text-fg-heading">{title}</p>
      <p className="max-w-110 type-body-sm-regular text-fg-caption">{description}</p>
    </div>
  );
}
