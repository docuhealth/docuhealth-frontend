import { describe, expect, it } from "vitest";
import { pageItems } from "@/lib/page-items";

describe("pageItems", () => {
  it("lists every page when there are seven or fewer", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(2, 2)).toEqual([1, 2]);
    expect(pageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("keeps the first five pages together near the start", () => {
    expect(pageItems(1, 20)).toEqual([1, 2, 3, 4, 5, "gap", 20]);
    expect(pageItems(3, 20)).toEqual([1, 2, 3, 4, 5, "gap", 20]);
  });

  it("shows the current page's neighbours in the middle", () => {
    expect(pageItems(10, 20)).toEqual([1, "gap", 9, 10, 11, "gap", 20]);
  });

  it("keeps the last five pages together near the end", () => {
    expect(pageItems(20, 20)).toEqual([1, "gap", 16, 17, 18, 19, 20]);
    expect(pageItems(18, 20)).toEqual([1, "gap", 16, 17, 18, 19, 20]);
  });
});
