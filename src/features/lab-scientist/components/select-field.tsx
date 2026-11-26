import { RequiredMark } from "@/components/required-mark";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * A labelled select for the lab's form dialogs: `options` maps each value to its label, in order.
 * `""` shows the placeholder.
 */
export function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  required,
  disabled,
  error,
}: {
  id: string;
  label: string;
  value: T | "";
  options: Record<T, string>;
  onChange: (value: T) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: { message?: string };
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="gap-1">
        {label} {required && <RequiredMark />}
      </FieldLabel>
      <Select
        items={options}
        value={value || null}
        onValueChange={(next) => next && onChange(next)}
        disabled={disabled}
      >
        <SelectTrigger id={id} aria-invalid={!!error} className="w-full bg-card">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(options) as [T, string][]).map(([option, text]) => (
            <SelectItem key={option} value={option}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={[error]} />
    </Field>
  );
}
