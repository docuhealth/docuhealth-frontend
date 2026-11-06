import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** The landing page's 1280px content width and side gutter. */
export function LandingContainer({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-328 px-4", className)} {...props}>
      {children}
    </div>
  );
}
