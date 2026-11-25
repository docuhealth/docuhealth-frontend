import { HospitalIcon } from "@phosphor-icons/react";

/** The facilities' "nothing here": a hospital on a brand-tinted square, a title and a line. */
export function FacilityEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-16 place-content-center rounded-xl bg-brand-50 text-primary [&_svg]:size-7">
        <HospitalIcon />
      </span>
      <p className="type-title-sm text-fg-heading">No facilities yet</p>
      <p className="max-w-110 type-body-sm-regular text-fg-caption">
        Healthcare facilities linked to your account will appear here.
      </p>
    </div>
  );
}
