import type { LocationRewrite } from "@tanstack/react-router";
import { env } from "@/env";

/**
 * The app's sections that live on their own subdomain. Their routes sit under a matching path
 * prefix (src/routes/hospital/…), and the router rewrites between the two:
 *
 *   hospital.docuhealthservices.net/register  ⇄  /hospital/register (internal)
 *
 * Everything else (public site, patients) is the main section on the root domain, with no prefix.
 * On hosts outside the root domain (e.g. preview deploys) nothing is rewritten and the prefixed
 * paths are used as-is.
 */
const sections = ["hospital", "admin", "agent"] as const;
type Section = (typeof sections)[number];

const rootDomains = ["localhost", env.VITE_ROOT_DOMAIN].filter((d): d is string => !!d);

/** The section a host serves, `null` for the main site, or `undefined` if it isn't ours. */
function sectionOfHost(hostname: string): Section | null | undefined {
  const root = rootDomains.find((d) => hostname === d || hostname.endsWith(`.${d}`));
  if (!root) return undefined;
  const sub = hostname.slice(0, -root.length).replace(/\.$/, "");
  return sections.find((section) => section === sub) ?? null;
}

function sectionOfPath(pathname: string): Section | null {
  const first = pathname.split("/")[1];
  return sections.find((section) => section === first) ?? null;
}

function hostFor(section: Section | null, hostname: string) {
  const current = sectionOfHost(hostname);
  const root = current ? hostname.slice(current.length + 1) : hostname.replace(/^www\./, "");
  return section ? `${section}.${root}` : root;
}

export const sectionRewrite: LocationRewrite = {
  // Real URL → internal: prefix the path with the host's section.
  input: ({ url }) => {
    const section = sectionOfHost(url.hostname);
    if (!section) return undefined;
    url.pathname = `/${section}${url.pathname === "/" ? "" : url.pathname}`;
    return url;
  },
  // Internal → real URL: send each section to its own subdomain, without the prefix.
  output: ({ url }) => {
    if (sectionOfHost(url.hostname) === undefined) return undefined;
    const section = sectionOfPath(url.pathname);
    if (section) url.pathname = url.pathname.slice(section.length + 1) || "/";
    url.hostname = hostFor(section, url.hostname);
    return url;
  },
};
