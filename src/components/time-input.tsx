import { ClockIcon } from "@phosphor-icons/react";
import { type Ref, useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTypedValue } from "@/hooks/use-typed-value";
import { maskTime, parseTime } from "@/lib/date-input";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const hours = Array.from({ length: 24 }, (_, hour) => pad(hour));
const minutes = Array.from({ length: 12 }, (_, index) => pad(index * 5));

/**
 * A 24-hour time typed as HH:MM, or picked from the hour and minute columns behind its icon
 * (minutes in fives; any minute can be typed). `value` is "HH:MM", and "" while what's typed
 * isn't a whole time.
 */
export function TimeInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  invalid,
  className,
  ref,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}) {
  const [open, setOpen] = useState(false);
  const { text, type } = useTypedValue({
    value,
    onChange,
    toText: (time) => time,
    parse: parseTime,
  });
  const [hour, minute] = value ? value.split(":") : [];

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
            placeholder="00:00"
            aria-invalid={invalid}
            value={text}
            onChange={(event) => type(maskTime(event.target.value))}
            onBlur={onBlur}
          />
          <InputGroupAddon align="inline-end">
            <PopoverTrigger asChild>
              <InputGroupButton size="icon-sm" aria-label="Choose a time">
                <ClockIcon className="size-5" />
              </InputGroupButton>
            </PopoverTrigger>
          </InputGroupAddon>
        </InputGroup>
      </PopoverAnchor>
      <PopoverContent align="end" className="w-auto flex-row gap-1 p-1.5">
        <TimeColumn
          label="Hour"
          options={hours}
          selected={hour}
          onPick={(picked) => onChange(`${picked}:${minute ?? "00"}`)}
        />
        <TimeColumn
          label="Minute"
          options={minutes}
          selected={minute}
          onPick={(picked) => {
            onChange(`${hour ?? "00"}:${picked}`);
            // The minute is the last thing to pick.
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function TimeColumn({
  label,
  options,
  selected,
  onPick,
}: {
  label: string;
  options: string[];
  selected: string | undefined;
  onPick: (option: string) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  // Opens scrolled to the current choice.
  useEffect(() => {
    listRef.current?.querySelector("[aria-pressed=true]")?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <ul
      ref={listRef}
      aria-label={label}
      className="flex h-60 w-16 flex-col gap-0.5 overflow-y-auto"
    >
      {options.map((option) => (
        <li key={option}>
          <button
            type="button"
            aria-pressed={option === selected}
            aria-label={`${option} ${label.toLowerCase()}`}
            onClick={() => onPick(option)}
            className="h-9 w-full rounded-md type-body-sm-regular text-fg-heading transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {option}
          </button>
        </li>
      ))}
    </ul>
  );
}
