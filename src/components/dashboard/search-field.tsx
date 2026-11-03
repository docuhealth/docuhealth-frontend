import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/**
 * Search box for a dashboard table (32px, 12px text); `size="lg"` is the 48px, 14px one a page
 * header uses. `label` names it for screen readers.
 */
export function SearchField({
  label,
  placeholder,
  value,
  onChange,
  size = "sm",
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <InputGroup
      className={cn(
        "w-full bg-card",
        size === "lg" ? "h-12 rounded-md" : "h-8 rounded-[4px] sm:w-64",
        className,
      )}
    >
      <InputGroupAddon>
        <MagnifyingGlassIcon className={size === "lg" ? "size-5" : "size-4"} />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={size === "lg" ? "type-body-sm-regular" : "type-caption"}
      />
    </InputGroup>
  );
}
