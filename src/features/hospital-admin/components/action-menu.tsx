import type { ComponentProps } from "react";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** The dashboard's small action menus (a staff row's ⋯, the banner's pencil). */
export function ActionMenuContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      align="end"
      className={cn("w-auto min-w-46 rounded-md p-2 shadow-sm ring-line", className)}
      {...props}
    />
  );
}

/** 32px item with a 16px icon; `variant="destructive"` makes it red. */
export function ActionMenuItem({ className, ...props }: ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      className={cn(
        "h-8 gap-2 rounded-md px-2 type-caption whitespace-nowrap text-fg-heading focus:bg-primary/10 focus:type-caption-medium focus:text-fg-heading data-[variant=destructive]:text-error-500 data-[variant=destructive]:focus:bg-error-100 data-[variant=destructive]:focus:text-error-500",
        className,
      )}
      {...props}
    />
  );
}
