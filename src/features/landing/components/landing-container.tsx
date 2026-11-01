import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** The landing page's content width and padding. Wrap every landing section's content in it. */
export function LandingContainer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-350 px-4 py-12 lg:py-16 xl:px-6", className)}
      {...props}
    />
  );
}
