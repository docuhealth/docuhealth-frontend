import { CalendarDotsIcon } from "@phosphor-icons/react";
import { type Ref, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTypedValue } from "@/hooks/use-typed-value";
import { dateText, fromIsoDate, maskDate, parseDate, toIsoDate } from "@/lib/date-input";
import { cn } from "@/lib/utils";

/** Where the calendar puts focus when it opens, best first (react-day-picker's classes). */
const dayFocusOrder = [
  ".rdp-selected button",
  ".rdp-today:not(.rdp-disabled) button",
  ".rdp-day:not(.rdp-disabled) button",
];

/**
 * A date typed as DD/MM/YYYY, or picked from the calendar behind its icon. `value` is
 * "YYYY-MM-DD", and "" while what's typed isn't a whole date. Days before `min` can't be
 * picked (they can still be typed, so say why in the form's validation).
 */
export function DateInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  min,
  invalid,
  className,
  ref,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  min?: Date;
  invalid?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}) {
  const [open, setOpen] = useState(false);
  const { text, type } = useTypedValue({ value, onChange, toText: dateText, parse: parseDate });
  const selected = value ? fromIsoDate(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <InputGroup className={cn("bg-card", className)}>
          <InputGroupInput
            ref={ref}
            id={id}
            name={name}
            inputMode="numeric"
            autoComplete="off"
            placeholder="DD/MM/YYYY"
            aria-invalid={invalid}
            value={text}
            onChange={(event) => type(maskDate(event.target.value))}
            onBlur={onBlur}
          />
          <InputGroupAddon align="inline-end">
            <PopoverTrigger asChild>
              <InputGroupButton size="icon-sm" aria-label="Choose a date">
                <CalendarDotsIcon className="size-5" />
              </InputGroupButton>
            </PopoverTrigger>
          </InputGroupAddon>
        </InputGroup>
      </PopoverAnchor>
      <PopoverContent
        align="end"
        className="w-auto p-0"
        // Start on the chosen day (or today, or the first open one) so the arrow keys move
        // between days, rather than on the previous-month button.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const calendar = event.currentTarget as HTMLElement;
          const day = dayFocusOrder
            .map((selector) => calendar.querySelector<HTMLButtonElement>(selector))
            .find(Boolean);
          day?.focus();
        }}
      >
        <Calendar
          mode="single"
          selected={selected}
          // A typed day that can't be picked opens on the first month that can.
          defaultMonth={selected && !(min && selected < min) ? selected : min}
          disabled={min ? { before: min } : undefined}
          weekStartsOn={1}
          onSelect={(date) => {
            if (!date) return;
            onChange(toIsoDate(date));
            setOpen(false);
          }}
          className="[--cell-size:--spacing(9)]"
        />
      </PopoverContent>
    </Popover>
  );
}
