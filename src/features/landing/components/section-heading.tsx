import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Wrap the bold half in <strong>. */
  title: ReactNode;
  description: ReactNode;
  /** Sets the description's measure, which decides where its lines break. */
  descriptionClassName?: string;
};

/** The centered heading and description above a landing section's content. */
export function SectionHeading({ title, description, descriptionClassName }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="type-section text-fg-heading">{title}</h2>
      <p className={cn("mt-4 max-w-135 type-lead text-fg-body", descriptionClassName)}>
        {description}
      </p>
    </div>
  );
}
