import { describe, expect, it } from "vitest";
import {
  flagLabel,
  formatNaira,
  rangeSummary,
  resultFor,
} from "@/features/patient/lib/lab-results";

const value = (flag: "normal" | "high" | "low") => ({ name: "x", value: "1", unit: "u", flag });

describe("lab results", () => {
  it("words a flag", () => {
    expect(flagLabel("high")).toBe("A little high");
    expect(flagLabel("normal")).toBe("Normal");
  });

  it("sums up how many results are outside the range", () => {
    expect(rangeSummary([value("normal"), value("high"), value("normal")])).toEqual({
      label: "1 of 3 results slightly outside range",
      outside: true,
    });
    expect(rangeSummary([value("normal"), value("normal")])?.label).toBe("All 2 results in range");
    expect(rangeSummary([])).toBeNull();
  });

  it("finds a test's values at a visit", () => {
    const results = [{ visitId: "7", test: "FBC", values: [] }];
    expect(resultFor(results, "7", "FBC")).toBe(results[0]);
    expect(resultFor(results, "6", "FBC")).toBeNull();
  });

  it("formats naira", () => {
    expect(formatNaira(40000)).toBe("₦40,000");
  });
});
