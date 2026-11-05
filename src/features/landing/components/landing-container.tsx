import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/features/landing/components/navbar";

/** The landing page's content width and padding. Wrap every landing section's content in it. */
export function LandingContainer({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-11/12 px-4 py-12 lg:py-16 xl:px-6", className)}
      {...props}
    >
      <Navbar />
      {children}
    </div>
  );
}
