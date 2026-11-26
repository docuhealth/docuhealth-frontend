import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bookableStaffQuery } from "@/features/receptionist/api/queries";

/** Who the patient will see: one of the hospital's active clinical staff, by sqid. */
export function StaffPicker({
  id,
  value,
  onChange,
  onBlur,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
}) {
  const { data: staff, isError } = useQuery(bookableStaffQuery());
  const items = Object.fromEntries(
    (staff ?? []).map(({ id, name, role }) => [id, role ? `${name} · ${role}` : name]),
  );

  return (
    <Select items={items} value={value || null} onValueChange={(next) => onChange(next ?? "")}>
      <SelectTrigger id={id} aria-invalid={invalid} onBlur={onBlur} className="w-full bg-card">
        <SelectValue
          placeholder={
            isError ? "Couldn’t load the staff list" : staff ? "Choose a staff member" : "Loading…"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([staffId, label]) => (
          <SelectItem key={staffId} value={staffId}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
