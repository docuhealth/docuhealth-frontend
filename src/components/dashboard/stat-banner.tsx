import type { ReactNode } from "react";
import defaultBannerUrl from "@/assets/images/dashboard-banner.jpg";

/**
 * The hospital's banner photo (`imageUrl`, or the default one) with `StatCard`s over its lower
 * half. `action` sits over the photo's top-right corner, e.g. a menu to change it.
 */
export function StatBanner({
  imageUrl,
  action,
  children,
}: {
  imageUrl: string | null;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-label="Overview" className="relative overflow-hidden rounded-2xl">
      <img
        src={imageUrl ?? defaultBannerUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <dl className="relative grid grid-cols-2 gap-3 p-3 pt-28 sm:pt-36 xl:grid-cols-4">
        {children}
      </dl>
      {/* After the cards, so it stacks above their full-banner grid and stays clickable. */}
      {action}
    </section>
  );
}
