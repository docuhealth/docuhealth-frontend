import { UserIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Family & proxy with no one on it: three overlapping people, a line, and both ways to add. */
export function FamilyEmpty({
  onAddDependant,
  onAddProxy,
}: {
  onAddDependant: () => void;
  onAddProxy: () => void;
}) {
  const person = (className: string, large = false) => (
    <span
      className={cn(
        "grid place-content-center rounded-full text-white ring-4 ring-surface",
        large ? "z-10 size-18 [&_svg]:size-8" : "size-12 [&_svg]:size-5",
        className,
      )}
    >
      <UserIcon />
    </span>
  );
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div aria-hidden className="mb-2 flex items-center">
        {person("-mr-3 bg-warning-500")}
        {person("bg-purple-500", true)}
        {person("-ml-3 bg-success-700")}
      </div>
      <p className="type-title-sm text-fg-heading">No one added yet</p>
      <p className="max-w-80 type-body-sm-regular text-fg-caption">
        Add a child to manage their care, or add someone you trust to help with yours.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          onClick={onAddDependant}
          className="h-10 px-5 type-body-sm-medium"
        >
          Add a dependent
        </Button>
        <Button onClick={onAddProxy} className="h-10 px-5 type-body-sm-medium">
          Add a proxy
        </Button>
      </div>
    </div>
  );
}
