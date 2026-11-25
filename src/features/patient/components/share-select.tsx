import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** One of the form's dropdowns, with "Select" until something is chosen. */
export function ShareSelect({
  id,
  items,
  value,
  invalid,
  onBlur,
  onChange,
}: {
  id: string;
  items: Record<string, ReactNode>;
  value: string;
  invalid: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      items={items}
      value={value || null}
      onValueChange={(next) => onChange((next as string | null) ?? "")}
    >
      <SelectTrigger id={id} aria-invalid={invalid} onBlur={onBlur} className="w-full bg-card">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([key, text]) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
