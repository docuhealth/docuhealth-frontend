import { UserIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * A dashed card where a Family & proxy list has no one yet: "Add someone you trust", "No one
 * yet". With `onAdd` the whole card is a button.
 */
export function FamilyPlaceholderCard({
  title,
  description,
  onAdd,
}: {
  title: string;
  description: string;
  onAdd?: () => void;
}) {
  const body = (
    <>
      <span className="grid size-9 shrink-0 place-content-center rounded-full bg-surface text-fg-caption">
        <UserIcon className="size-4" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="type-body-sm-medium text-fg-heading">{title}</span>
        <span className="type-caption text-fg-caption">{description}</span>
      </span>
    </>
  );
  const className =
    "flex w-full items-center gap-3 rounded-xl border border-dashed border-divider px-4 py-3 text-left";
  return onAdd ? (
    <button
      type="button"
      onClick={onAdd}
      className={cn(className, "transition-colors hover:border-primary/40 hover:bg-card")}
    >
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  );
}
