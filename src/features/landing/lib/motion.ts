/** The landing page's motion settings, shared by its animated sections. */

/** A soft "ease out": quick to start, long settle. */
export const ease = [0.22, 1, 0.36, 1] as const;

/** A card that lifts a little under the pointer (only on devices that can hover). */
export const liftOnHover =
  "transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg";
