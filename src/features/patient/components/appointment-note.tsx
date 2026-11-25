import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  info: { box: "bg-info-100", title: "text-info-700" },
  success: { box: "bg-success-100", title: "text-success-700" },
};

/** A tinted note on an appointment: "Reminders on", "Confirmation sent". */
export function AppointmentNote({
  tone,
  title,
  children,
}: {
  tone: keyof typeof tones;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={cn("flex flex-col gap-1 rounded-xl p-4", tones[tone].box)}
    >
      <p className={cn("type-body-sm-medium", tones[tone].title)}>{title}</p>
      <p className="type-caption text-fg-body">{children}</p>
    </section>
  );
}
