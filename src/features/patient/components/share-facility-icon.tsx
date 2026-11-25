import healthcareIconUrl from "@/assets/svgs/healthcare.svg";

/** The green hospital tile beside whoever a share is with, or who viewed the record. */
export function ShareFacilityIcon() {
  return (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-content-center rounded-md bg-success-100"
    >
      <img src={healthcareIconUrl} alt="" className="size-5" />
    </span>
  );
}
