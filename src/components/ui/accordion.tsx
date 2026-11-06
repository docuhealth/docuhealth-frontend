import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-line py-2 first:border-t", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-center justify-between py-4 text-left font-bold text-fg-heading transition-colors outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden
          className="relative flex size-5 shrink-0 items-center justify-center transition-transform duration-300 ease-in-out group-aria-expanded/accordion-trigger:rotate-180"
        >
          {/* Horizontal minus line */}
          <span className="absolute h-[1.5px] w-4.5 rounded-full bg-primary" />
          {/* Vertical line that collapses/rotates into horizontal line when opened */}
          <span className="absolute h-4.5 w-[1.5px] rounded-full bg-primary transition-all duration-300 ease-in-out group-aria-expanded/accordion-trigger:scale-y-0 group-aria-expanded/accordion-trigger:rotate-90 group-aria-expanded/accordion-trigger:opacity-0" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden transition-all duration-300 data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div className={cn("pt-1 pb-5 type-body-sm-regular text-fg-body", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
