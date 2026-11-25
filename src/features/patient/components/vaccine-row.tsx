import { SyringeIcon } from "@phosphor-icons/react";
import type { LinkProps } from "@tanstack/react-router";
import { RelatedRow } from "@/features/patient/components/related-row";

/** A vaccine or a dose on its syringe tile: green when given, amber when due. */
export function VaccineRow({
  title,
  detail,
  due = false,
  to,
  params,
}: {
  title: string;
  detail: string | null;
  due?: boolean;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
}) {
  return (
    <RelatedRow
      icon={<SyringeIcon aria-hidden />}
      tone={due ? "warning" : "success"}
      title={title}
      detail={detail}
      to={to}
      params={params}
    />
  );
}
