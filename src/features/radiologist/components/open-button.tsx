import { CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/** The caret at the end of a dashboard card's row. */
export function OpenButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      onClick={onClick}
      className="-mr-1.5 text-fg-caption"
    >
      <CaretRightIcon className="size-4" />
    </Button>
  );
}
