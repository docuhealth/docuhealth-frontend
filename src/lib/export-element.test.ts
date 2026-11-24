import { describe, expect, it } from "vitest";
import { pdfFileName, printElement } from "@/lib/export-element";

describe("pdfFileName", () => {
  it("slugifies each part and joins them", () => {
    expect(
      pdfFileName("Ada Obi", "Full Blood Count (FBC)", "Lagos University Teaching Hospital"),
    ).toBe("ada_obi_full_blood_count_fbc_lagos_university_teaching_hospital.pdf");
  });

  it("leaves out empty parts", () => {
    expect(pdfFileName("Ada Obi", "", "  ", "LUTH")).toBe("ada_obi_luth.pdf");
    expect(pdfFileName("")).toBe("document.pdf");
  });
});

describe("printElement", () => {
  it("refuses without an element", async () => {
    await expect(printElement(null)).rejects.toThrow("Nothing to print");
  });

  it("copies the element into a hidden print frame at once", () => {
    const node = document.createElement("div");
    node.innerHTML = "<p>Result</p><button data-print-hide>Close</button>";

    void printElement(node, 'Lab report · "Ada" <Obi>');

    const frame = document.querySelector("iframe");
    expect(frame).toHaveAttribute("aria-hidden", "true");
    expect(frame?.srcdoc).toContain("<p>Result</p>");
    expect(frame?.srcdoc).toContain("<title>Lab report · &quot;Ada&quot; &lt;Obi&gt;</title>");
    expect(frame?.srcdoc).toContain("[data-print-hide] { display: none !important; }");
    // Gone before it loads, so jsdom (which can't print) never tries.
    frame?.remove();
  });
});
