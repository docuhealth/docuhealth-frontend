import { CaretRightIcon } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PersonAvatar } from "@/components/dashboard/person-avatar";

/**
 * A person on Family & proxy: their photo or initials, name, a line about them, a tag on the
 * right and a chevron. Opens `to`, or calls `onOpen`. Goes inside a `RecordList`.
 */
export function FamilyPersonRow({
  name,
  photoUrl = null,
  detail,
  status,
  to,
  params,
  onOpen,
}: {
  name: string;
  photoUrl?: string | null;
  detail: ReactNode;
  status?: ReactNode;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
  onOpen?: () => void;
}) {
  const body = (
    <>
      <PersonAvatar name={name} src={photoUrl} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-body-sm-medium text-fg-heading">{name}</span>
        <span className="truncate type-caption text-fg-caption">{detail}</span>
      </span>
      {status}
      <CaretRightIcon className="size-4 shrink-0 text-fg-caption" aria-hidden />
    </>
  );
  const className =
    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface";
  return (
    <li>
      {to ? (
        <Link to={to} params={params} className={className}>
          {body}
        </Link>
      ) : (
        <button type="button" onClick={onOpen} className={className}>
          {body}
        </button>
      )}
    </li>
  );
}
