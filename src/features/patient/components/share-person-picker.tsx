import { CheckCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { SearchField } from "@/components/dashboard/search-field";
import type { SharingPerson } from "@/features/patient/api/pending-sharing";
import { peopleAt } from "@/features/patient/lib/sharing";
import { cn } from "@/lib/utils";

/** Search the people at the chosen facility and pick one. */
export function SharePersonPicker({
  people,
  facility,
  value,
  invalid,
  onChange,
}: {
  people: SharingPerson[];
  facility: string;
  value: string;
  invalid: boolean;
  onChange: (personId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const matches = facility ? peopleAt(people, facility, search) : [];
  return (
    <div className="flex flex-col gap-2">
      <SearchField
        label="Search people"
        placeholder={facility ? "Search" : "Choose a facility first"}
        value={search}
        onChange={setSearch}
        size="lg"
        className={cn(invalid && "border-destructive")}
      />
      {facility && (
        <div
          role="radiogroup"
          aria-label="Who are you sharing with?"
          className="flex max-h-48 flex-col divide-y overflow-y-auto rounded-md border bg-card"
        >
          {matches.length === 0 ? (
            <p className="px-4 py-3 type-caption text-fg-caption">
              {search ? "No one matches your search." : "No one to share with here yet."}
            </p>
          ) : (
            matches.map((person) => {
              const chosen = person.id === value;
              return (
                <label
                  key={person.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-focus-visible:ring-inset",
                    chosen ? "bg-brand-50" : "hover:bg-surface",
                  )}
                >
                  <input
                    type="radio"
                    name="share-person"
                    value={person.id}
                    checked={chosen}
                    onChange={() => onChange(person.id)}
                    className="sr-only"
                  />
                  <PersonAvatar name={person.name} src={null} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate type-body-sm-medium text-fg-heading">
                      {person.name}
                    </span>
                    {person.role && (
                      <span className="truncate type-caption text-fg-caption">{person.role}</span>
                    )}
                  </span>
                  {chosen && (
                    <CheckCircleIcon weight="fill" aria-hidden className="size-5 text-primary" />
                  )}
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
