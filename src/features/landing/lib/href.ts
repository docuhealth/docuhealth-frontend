import type { LinkProps } from "@tanstack/react-router";

/** A page of the public site, with an optional home page section: "/our-mission", "/#faq". */
export type LandingHref = `/${string}`;

/** A `LandingHref` as the router takes it. */
export function splitHref(href: LandingHref) {
  const [path = "/", hash] = href.split("#");
  return { to: (path || "/") as LinkProps["to"], hash: hash || undefined };
}
