import type { LinkProps } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useEffect, useState } from "react";

/** What the top bar shows for the current page: its title, a line under it, and a way back. */
export type PageHeadingValue = {
  title: string;
  subtitle?: string | null;
  back?: { to: LinkProps["to"]; params?: LinkProps["params"]; label: string };
};

const HeadingContext = createContext<{ set: (heading: PageHeadingValue) => void } | null>(null);

/** Holds the page heading the top bar shows; the patient layout wraps every page in it. */
export function PatientHeadingProvider({
  children,
  render,
}: {
  children: ReactNode;
  render: (heading: PageHeadingValue) => ReactNode;
}) {
  const [heading, setHeading] = useState<PageHeadingValue>({ title: "" });
  return (
    <HeadingContext value={{ set: setHeading }}>
      {render(heading)}
      {children}
    </HeadingContext>
  );
}

/** A page names itself in the top bar (and the browser tab). Renders nothing itself. */
export function PageHeading({ title, subtitle, back }: PageHeadingValue) {
  const context = use(HeadingContext);
  const set = context?.set;
  const backTo = back?.to;
  const backLabel = back?.label;
  // Params by value, so a new object each render doesn't set the heading again.
  const backParams = JSON.stringify(back?.params ?? null);
  useEffect(() => {
    const params = JSON.parse(backParams) as LinkProps["params"] | null;
    set?.({
      title,
      subtitle,
      back:
        backTo && backLabel
          ? { to: backTo, label: backLabel, ...(params ? { params } : {}) }
          : undefined,
    });
  }, [set, title, subtitle, backTo, backLabel, backParams]);
  return <title>{`${title} · DocuHealth`}</title>;
}
