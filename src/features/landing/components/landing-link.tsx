import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { type LandingHref, splitHref } from "@/features/landing/lib/href";

/**
 * A link on the public site, written as a plain href: a page ("/our-mission"), or a home page
 * section ("/#faq"), which scrolls into view. It stays in the app either way.
 */
export function LandingLink({
  href,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { href: LandingHref }) {
  const { to, hash } = splitHref(href);
  return <Link to={to} hash={hash} {...props} />;
}
