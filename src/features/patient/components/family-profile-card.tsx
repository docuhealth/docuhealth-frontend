import { CaretRightIcon } from "@phosphor-icons/react";
import { PersonAvatar } from "@/components/dashboard/person-avatar";

/** A dependant's or proxy's card at the top of their page; opens their details. */
export function FamilyProfileCard({
  name,
  photoUrl = null,
  detail,
  onOpen,
}: {
  name: string;
  photoUrl?: string | null;
  detail: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${name}’s details`}
      className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40"
    >
      <PersonAvatar name={name} src={photoUrl} size="xl" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-title-sm text-fg-heading">{name}</span>
        <span className="truncate type-caption text-fg-caption">{detail}</span>
      </span>
      <CaretRightIcon className="size-4 shrink-0 text-fg-caption" aria-hidden />
    </button>
  );
}
