import {
  DeskIcon,
  FlaskIcon,
  HeadsetIcon,
  type Icon,
  PillIcon,
  RadioactiveIcon,
  ReceiptIcon,
  StethoscopeIcon,
  SyringeIcon,
} from "@phosphor-icons/react";
import { type PersonnelType, personnelTypes } from "@/features/patient/api/pending-messages";
import { personnelTypeLabels } from "@/features/patient/lib/messages";
import { cn } from "@/lib/utils";

const icons: Record<PersonnelType, Icon> = {
  doctor: StethoscopeIcon,
  nurse: SyringeIcon,
  lab: FlaskIcon,
  radiologist: RadioactiveIcon,
  pharmacist: PillIcon,
  receptionist: DeskIcon,
  billing: ReceiptIcon,
  support: HeadsetIcon,
};

/** The kinds of personnel to message, as toggle chips with icons; one is always chosen. */
export function NewMessageTypeChips({
  value,
  onChange,
}: {
  value: PersonnelType;
  onChange: (value: PersonnelType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {personnelTypes.map((type) => {
        const TypeIcon = icons[type];
        const chosen = value === type;
        return (
          <button
            key={type}
            type="button"
            aria-pressed={chosen}
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 type-caption-medium ring-1",
              chosen
                ? "bg-brand-50 text-primary ring-primary"
                : "bg-card text-fg-caption ring-line hover:ring-fg-caption/40",
            )}
          >
            <TypeIcon className="size-4" aria-hidden />
            {personnelTypeLabels[type]}
          </button>
        );
      })}
    </div>
  );
}
