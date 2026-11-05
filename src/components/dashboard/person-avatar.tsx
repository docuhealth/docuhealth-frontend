import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Initials sit on one of these, picked by name so a person keeps the same color everywhere.
const fallbackColors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

function colorFor(name: string) {
  let sum = 0;
  for (const char of name) sum += char.codePointAt(0) ?? 0;
  return fallbackColors[sum % fallbackColors.length];
}

/** A person's photo, or their initials: 32px, 24px when `size="sm"`, 56px when `size="xl"`. */
export function PersonAvatar({
  name,
  src,
  online,
  size = "md",
}: {
  name: string;
  src: string | null;
  /** Shows a green dot. */
  online?: boolean;
  size?: "sm" | "md" | "xl";
}) {
  return (
    <Avatar
      size={size === "sm" ? "sm" : "default"}
      className={size === "xl" ? "size-14" : undefined}
    >
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback
        className={cn(
          { sm: "type-caption", md: "type-caption-medium", xl: "type-accent-h3" }[size],
          "text-white",
          colorFor(name),
        )}
      >
        {initials(name)}
      </AvatarFallback>
      {online && <AvatarBadge className="bg-success-500" />}
    </Avatar>
  );
}
