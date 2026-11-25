import { facilityInitials } from "@/features/patient/lib/facilities";

/** A facility's photo, or its initials on a green tint when it has none. */
export function FacilityTile({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  return photoUrl ? (
    <img src={photoUrl} alt="" className="size-9 shrink-0 rounded-md object-cover" />
  ) : (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-content-center rounded-md bg-success-100 type-caption-semibold text-success-700"
    >
      {facilityInitials(name)}
    </span>
  );
}
