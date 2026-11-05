import type { ComponentProps, ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/** A row of `CountTab`s over a full-width divider. */
export function CountTabsList({ className, ...props }: ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      variant="line"
      className={cn(
        "w-full justify-start gap-7 overflow-x-auto rounded-none border-b p-0 group-data-horizontal/tabs:h-auto",
        className,
      )}
      {...props}
    />
  );
}

/** A tab with a count after its label, underlined in the brand color while it's chosen. */
export function CountTab({
  value,
  count,
  className,
  children,
}: {
  value: string;
  /** Left out until it's known. */
  count?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "group/tab h-auto flex-none gap-2.5 rounded-none px-0 pt-5 pb-4 type-body-sm-regular text-fg-caption after:rounded-t-full after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-[3px] hover:text-fg-heading data-active:text-primary",
        className,
      )}
    >
      {children}
      {count !== undefined && (
        <span className="min-w-6 rounded-full bg-line px-2 py-0.5 text-center type-caption-semibold text-fg-caption group-data-[state=active]/tab:bg-primary group-data-[state=active]/tab:text-primary-foreground">
          {count}
        </span>
      )}
    </TabsTrigger>
  );
}
