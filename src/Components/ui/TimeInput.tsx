import React, { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";

export interface TimeInputProps {
  /** 24-hour "HH:MM" string (backend format), or "" when unset. */
  value?: string;
  /**
   * Called with a native-input-shaped event so this is a drop-in swap for
   * `<Input type="time" onChange={(e) => ... e.target.value} />`. The value
   * is always a 24-hour "HH:MM" string.
   */
  onChange: (event: { target: { value: string; name?: string } }) => void;
  label?: string;
  /** Shows a red "*" after the label. Visual only. */
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  /** Granularity of the minutes column. Defaults to every minute. */
  minuteStep?: number;
  name?: string;
  id?: string;
  containerClassName?: string;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const parse = (value?: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const h24 = Number(match[1]);
  const minute = Number(match[2]);
  if (h24 > 23 || minute > 59) return null;
  return { h24, minute };
};

const to24 = (hour12: number, minute: number, meridiem: "AM" | "PM") => {
  const h24 =
    meridiem === "AM" ? hour12 % 12 : (hour12 % 12) + 12;
  return `${pad(h24)}:${pad(minute)}`;
};

/**
 * 12-hour time picker with an explicit AM/PM column. Native
 * `<input type="time">` renders 12h or 24h purely off the browser locale
 * with no way to force it, so anywhere the UI needs to guarantee AM/PM we
 * use this instead. Same button-trigger + dropdown-panel look as `Select`.
 */
const TimeInput = ({
  value,
  onChange,
  label,
  required = false,
  error,
  disabled = false,
  placeholder = "--:-- --",
  minuteStep = 1,
  name,
  id,
  containerClassName = "",
  className = "",
}: TimeInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = parse(value);
  const hour12 = parsed ? parsed.h24 % 12 || 12 : null;
  const minute = parsed ? parsed.minute : null;
  const meridiem: "AM" | "PM" | null = parsed
    ? parsed.h24 >= 12
      ? "PM"
      : "AM"
    : null;

  const hours = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1),
    []
  );
  const minutes = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(60 / minuteStep) },
        (_, i) => i * minuteStep
      ),
    [minuteStep]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const emit = (next: string) => onChange({ target: { value: next, name } });

  // When nothing is set yet, a partial pick fills the rest with a sensible
  // default (12:00 PM) so `value` is always a complete "HH:MM".
  const pickHour = (h12: number) =>
    emit(to24(h12, minute ?? 0, meridiem ?? "PM"));
  const pickMinute = (m: number) =>
    emit(to24(hour12 ?? 12, m, meridiem ?? "PM"));
  const pickMeridiem = (m: "AM" | "PM") =>
    emit(to24(hour12 ?? 12, minute ?? 0, m));

  const displayText = parsed
    ? `${pad(hour12 as number)}:${pad(minute as number)} ${meridiem}`
    : placeholder;

  const columnClass =
    "flex-1 max-h-48 overflow-y-auto border-r border-gray-100 last:border-r-0";
  const cellClass = (active: boolean) =>
    `py-2 text-center text-sm cursor-pointer transition-colors ${
      active
        ? "bg-docuhealth-primary text-white font-semibold"
        : "text-gray-700 hover:bg-docuhealth-primary/10"
    }`;

  return (
    <div className={`relative w-full ${containerClassName}`} ref={ref}>
      {label && (
        <p className="font-semibold pb-1 whitespace-nowrap">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
      )}

      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 text-sm text-left focus:outline-hidden focus:border-docuhealth-primary transition-colors ${
          disabled
            ? "bg-gray-100 cursor-not-allowed border-gray-300"
            : "cursor-pointer hover:border-docuhealth-primary"
        } ${
          error ? "border-red-500 focus:border-red-500" : "border-gray-300"
        } ${className}`}
      >
        <span className={parsed ? "" : "text-gray-400"}>{displayText}</span>
        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 flex overflow-hidden">
          <div className={columnClass}>
            {hours.map((h) => (
              <div
                key={h}
                onClick={() => pickHour(h)}
                className={cellClass(hour12 === h)}
              >
                {pad(h)}
              </div>
            ))}
          </div>
          <div className={columnClass}>
            {minutes.map((m) => (
              <div
                key={m}
                onClick={() => pickMinute(m)}
                className={cellClass(minute === m)}
              >
                {pad(m)}
              </div>
            ))}
          </div>
          <div className="flex-1 flex flex-col">
            {(["AM", "PM"] as const).map((m) => (
              <div
                key={m}
                onClick={() => pickMeridiem(m)}
                className={`flex-1 flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${
                  meridiem === m
                    ? "bg-docuhealth-primary text-white"
                    : "text-gray-700 hover:bg-docuhealth-primary/10"
                }`}
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

TimeInput.displayName = "TimeInput";

export default TimeInput;
