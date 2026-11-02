import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FieldSeparator } from "@/components/ui/field";

/** Title and one-line description at the top of an auth form. */
export function AuthHeader({ title, description }: { title: string; description: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="type-h3">{title}</h1>
      <p className="type-body-sm-regular text-muted-foreground">{description}</p>
    </div>
  );
}

/** Centered icon, title and message shown in place of a form (e.g. "Check your email"). */
export function AuthNotice({
  icon,
  tone = "brand",
  title,
  children,
}: {
  icon: ReactNode;
  tone?: "brand" | "error";
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        className={
          tone === "error"
            ? "grid size-14 place-content-center rounded-2xl bg-error-100 text-error-500 [&_svg]:size-6"
            : "grid size-14 place-content-center rounded-2xl bg-primary/10 text-primary [&_svg]:size-6"
        }
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="type-h3">{title}</h1>
        {children}
      </div>
    </div>
  );
}

/** "or" divider and a prompt linking to the other auth page, below the form. */
export function AuthFooter({
  prompt,
  linkText,
  to,
}: {
  prompt: string;
  linkText: string;
  to: LinkProps["to"];
}) {
  return (
    <>
      <FieldSeparator className="type-caption">or</FieldSeparator>
      <p className="text-center type-body-sm-regular text-muted-foreground">
        {prompt}{" "}
        <Link to={to} className="text-primary hover:underline">
          {linkText}
        </Link>
      </p>
    </>
  );
}
