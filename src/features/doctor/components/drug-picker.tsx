import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { type DrugSuggestion, drugSearchQuery } from "@/features/doctor/api/orders";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * A drug name box that suggests catalogue drugs as it's typed: `onPick` when one is chosen,
 * `onType` for each change (a typed name leaves the catalogue drug behind).
 */
export function DrugPicker({
  id,
  value,
  invalid,
  onType,
  onPick,
}: {
  id: string;
  value: string;
  invalid: boolean;
  onType: (name: string) => void;
  onPick: (drug: DrugSuggestion) => void;
}) {
  const [open, setOpen] = useState(false);
  const term = useDebouncedValue(value.trim());
  const { data: suggestions } = useQuery({
    ...drugSearchQuery(term),
    enabled: open && term.length >= 2,
  });

  return (
    <div className="relative">
      <Input
        id={id}
        autoComplete="off"
        placeholder="Search, e.g. Ceftriaxone"
        aria-invalid={invalid}
        className="bg-card"
        value={value}
        onChange={(event) => {
          onType(event.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions && suggestions.length > 0 && (
        <ul
          aria-label="Matching drugs"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border bg-card shadow-md"
        >
          {suggestions.map((drug) => (
            <li key={drug.code}>
              <button
                type="button"
                // Before the input's blur closes the list.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onPick(drug);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left type-body-sm-regular hover:bg-line"
              >
                {drug.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
