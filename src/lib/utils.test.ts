import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("lets a type role replace a component's own font classes", () => {
    expect(cn("font-heading text-base leading-snug font-medium", "type-h2")).toBe("type-h2");
  });

  it("keeps non-typography classes next to a type role", () => {
    expect(cn("px-2 text-primary", "type-label")).toBe("px-2 text-primary type-label");
  });

  it("still merges ordinary Tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
