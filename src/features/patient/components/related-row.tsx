import { CaretRightIcon } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tiles = {
  info: "bg-info-100 text-info-600",
  success: "bg-success-100 text-success-700",
  purple: "bg-purple-500/10 text-purple-500",
  warning: "bg-warning-100 text-warning-500",
  neutral: "bg-surface text-fg-body",
};

/**
 * A row in a "From this visit", "Next steps" or "Related" list: an icon on a tinted tile, a title
 * and a line, an optional tag, and a chevron when it opens `to`. Goes inside a `RecordList`.
 */
export function RelatedRow({
  icon,
  tone = "neutral",
  title,
  detail,
  status,
  to,
  params,
}: {
  icon?: ReactNode;
  tone?: keyof typeof tiles;
  title: ReactNode;
  detail?: ReactNode;
  status?: ReactNode;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
}) {
  const body = (
    <>
      {icon && (
        <span
          className={cn(
            "grid size-9 shrink-0 place-content-center rounded-md [&_img]:size-5 [&_svg]:size-5",
            tiles[tone],
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-body-sm-medium text-fg-heading">{title}</span>
        {detail && <span className="truncate type-caption text-fg-caption">{detail}</span>}
      </span>
      {status}
      {to && <CaretRightIcon className="size-4 shrink-0 text-fg-caption" aria-hidden />}
    </>
  );
  return (
    <li>
      {to ? (
        <Link
          to={to}
          params={params}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">{body}</div>
      )}
    </li>
  );
}
