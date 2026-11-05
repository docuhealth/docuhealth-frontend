import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * A table filter (48px, 14px medium text; 36px when `size="sm"`). `display` words the choice on
 * the button when it differs from the option, e.g. "Sort: Latest"; `highlight` outlines it in
 * the brand color; `icon` leads the button.
 */
export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  display,
  highlight,
  icon,
  size = "lg",
  className,
}: {
  /** Names it for screen readers. */
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
  display?: (value: T) => string;
  highlight?: boolean;
  icon?: ReactNode;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <Select items={options} value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          "min-w-32 gap-2 bg-card px-4 type-body-sm-medium text-fg-heading [&_svg]:text-fg-heading",
          highlight && "border-primary text-primary [&_svg]:text-primary",
          size === "sm" && "min-w-0 gap-1.5 px-3 data-[size=default]:h-9",
          className,
        )}
      >
        {icon}
        <SelectValue>{display && ((chosen: T) => display(chosen))}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(options) as [T, string][]).map(([option, text]) => (
          <SelectItem key={option} value={option}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
