import { describe, expect, it } from "vitest";
import { keepPreviousPage } from "@/lib/keep-previous-page";

describe("keepPreviousPage", () => {
  const rows = ["the case notes' rows"];

  it("keeps the last page of the same list while the next loads", () => {
    const placeholder = keepPreviousPage(["notes", "hin-1", "case", 2]);
    expect(placeholder(rows, { queryKey: ["notes", "hin-1", "case", 1] })).toBe(rows);
  });

  it("shows nothing for another list, rather than its rows under the new heading", () => {
    const placeholder = keepPreviousPage(["notes", "hin-1", "care-plan", 1]);
    expect(placeholder(rows, { queryKey: ["notes", "hin-1", "case", 1] })).toBeUndefined();
    expect(placeholder(rows, undefined)).toBeUndefined();
  });
});
