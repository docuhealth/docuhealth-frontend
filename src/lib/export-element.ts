// Print and PDF export for one element of a page, e.g. an official report. `window.print()` would
// print the whole page (sidebar, buttons); these output only the element they're given. Markers
// on elements inside it:
//   data-print-hide  left out of the print and the PDF (e.g. buttons)
//   data-print-only  hidden on screen, shown in the print and the PDF
//   data-pdf-unit    a block (a row, a card) the PDF may break a page after, but not inside

const HIDE_ATTR = "data-print-hide";
const PRINT_ONLY_ATTR = "data-print-only";
const UNIT_ATTR = "data-pdf-unit";

/** A4 portrait, in mm. */
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
/** Space above the content on every page after the first (the first starts at the very top). */
const CONTINUED_TOP = 10;
/** Space below the content on every page. */
const BOTTOM = 10;
/** Render at twice the element's CSS size, so the text stays sharp when printed. */
const PIXEL_RATIO = 2;

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char,
  );

/**
 * A PDF's file name from its parts, each slugified: ("Ada Obi", "Full blood count", "LUTH") →
 * "ada_obi_full_blood_count_luth.pdf". Empty parts are left out.
 */
export function pdfFileName(...parts: string[]) {
  const slugs = parts
    .map((part) =>
      part
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, ""),
    )
    .filter(Boolean);
  return `${slugs.join("_") || "document"}.pdf`;
}

/**
 * Prints `node` on its own: copies it and the page's stylesheets into a hidden iframe and prints
 * that, on A4. The node is copied before this returns, so it can be unmounted straight after.
 * Resolves once the print dialog is closed (or after a minute, as some browsers never say).
 */
export function printElement(node: HTMLElement | null, title = document.title) {
  return new Promise<void>((resolve, reject) => {
    if (!node) {
      reject(new Error("Nothing to print"));
      return;
    }

    const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')]
      .map((style) => style.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      iframe.remove();
      resolve();
    };

    iframe.addEventListener("load", () => {
      const view = iframe.contentWindow;
      if (!view) {
        iframe.remove();
        reject(new Error("Couldn’t open the print view"));
        return;
      }
      // Fonts are only a nicety: print with what's loaded.
      void view.document.fonts.ready
        .catch(() => undefined)
        .then(() => {
          view.addEventListener("afterprint", cleanup, { once: true });
          view.focus();
          view.print();
          setTimeout(cleanup, 60_000);
        });
    });

    // A srcdoc document resolves relative URLs (stylesheets, fonts, images) against this page's.
    iframe.srcdoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    ${styles}
    <style>
      @page { size: A4 portrait; margin: ${CONTINUED_TOP}mm 0 ${BOTTOM}mm; }
      @page :first { margin-top: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-shadow: none !important; }
      [${UNIT_ATTR}] { break-inside: avoid; }
      [${HIDE_ATTR}] { display: none !important; }
      [${PRINT_ONLY_ATTR}] { display: block !important; }
      body > * { width: 100% !important; max-width: none !important; margin: 0 !important; }
    </style>
  </head>
  <body>${node.outerHTML}</body>
</html>`;

    document.body.append(iframe);
  });
}

/**
 * Saves `node` as an A4 portrait PDF called `fileName`, as an image of it fitted to the page's
 * width. Content taller than a page continues on the next, broken after the last
 * `data-pdf-unit` block that fits (or at the page's end, if no block does). The node must be in
 * the document and laid out; render it off-screen if it isn't shown.
 */
export async function downloadElementAsPdf(node: HTMLElement | null, fileName: string) {
  if (!node) throw new Error("Nothing to export");

  // Both are heavy, and only needed here.
  const [{ toCanvas }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);

  const printOnly = [...node.querySelectorAll<HTMLElement>(`[${PRINT_ONLY_ATTR}]`)];
  const shownBefore = printOnly.map((element) => element.style.getPropertyValue("display"));
  for (const element of printOnly) element.style.setProperty("display", "block", "important");

  try {
    await document.fonts.ready;
    const canvas = await toCanvas(node, {
      pixelRatio: PIXEL_RATIO,
      backgroundColor: "#ffffff",
      filter: (child) => !(child instanceof Element && child.hasAttribute(HIDE_ATTR)),
    });

    // Where a page may end, in canvas pixels from the top: after each unit.
    const { top, height } = node.getBoundingClientRect();
    const scale = canvas.height / height;
    const cuts = [...node.querySelectorAll(`[${UNIT_ATTR}]`)]
      .filter((unit) => !unit.closest(`[${HIDE_ATTR}]`))
      .map((unit) => Math.round((unit.getBoundingClientRect().bottom - top) * scale))
      .sort((a, b) => a - b);

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pxPerMm = canvas.width / PAGE_WIDTH;
    // A page holds at least this much before it breaks at a unit, so one tall block can't leave
    // a page almost empty.
    const minimumSlice = Math.round(PAGE_HEIGHT * 0.25 * pxPerMm);

    let offset = 0;
    for (let page = 0; offset < canvas.height; page += 1) {
      const pageTop = page === 0 ? 0 : CONTINUED_TOP;
      let end = Math.min(
        offset + Math.floor((PAGE_HEIGHT - pageTop - BOTTOM) * pxPerMm),
        canvas.height,
      );
      if (end < canvas.height) {
        const cut = cuts.filter((at) => at > offset + minimumSlice && at <= end).at(-1);
        if (cut) end = cut;
      }

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = end - offset;
      const context = slice.getContext("2d");
      if (!context) throw new Error("Couldn’t draw the PDF page");
      context.drawImage(
        canvas,
        0,
        offset,
        canvas.width,
        slice.height,
        0,
        0,
        canvas.width,
        slice.height,
      );

      if (page > 0) pdf.addPage();
      // "FAST" compresses the image; uncompressed, every page is several MB.
      pdf.addImage(slice, "PNG", 0, pageTop, PAGE_WIDTH, slice.height / pxPerMm, undefined, "FAST");
      offset = end;
    }

    await pdf.save(fileName, { returnPromise: true });
  } finally {
    printOnly.forEach((element, index) => {
      const display = shownBefore[index];
      if (display) element.style.setProperty("display", display);
      else element.style.removeProperty("display");
    });
  }
}
