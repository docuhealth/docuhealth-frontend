// Print / PDF export for a single region of a page. window.print() prints the
// whole page (sidebar, header, buttons); these helpers output only the node
// they're given. Markers for elements inside it:
//   data-print-hide  left out of the output (action buttons, etc.)
//   data-print-only  hidden on screen (e.g. class "hidden"), shown in the output
//   data-pdf-unit    a row/image the PDF may break a page after, but not inside
//                    (only matters for a block taller than one page)

const HIDE_ATTR = "data-print-hide";
const PRINT_ONLY_ATTR = "data-print-only";
const UNIT_ATTR = "data-pdf-unit";
const PDF_SCALE = 2;

const escapeHtml = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Prints `node` on its own by copying it, plus the app's stylesheets, into a
// hidden iframe and printing that. Resolves once the print dialog is done.
export const printElement = (node, title = document.title) =>
  new Promise((resolve, reject) => {
    if (!node) {
      reject(new Error("Nothing to print"));
      return;
    }

    const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((n) => n.outerHTML).join("\n");

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";

    const cleanup = () => {
      iframe.remove();
      resolve();
    };

    iframe.onload = async () => {
      const win = iframe.contentWindow;
      try {
        await win.document.fonts?.ready;
      } catch {
        // Font loading state is only a nicety; print anyway.
      }
      win.addEventListener("afterprint", cleanup, { once: true });
      win.focus();
      win.print();
      // Some browsers never fire afterprint for an iframe; don't leak it.
      setTimeout(cleanup, 60000);
    };

    iframe.srcdoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    ${styles}
    <style>
      @page { size: A4; margin: 12mm; }
      html, body { background: #fff !important; margin: 0; padding: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      li, p, [${UNIT_ATTR}] { break-inside: avoid; }
      img { max-width: 100%; }
      [${HIDE_ATTR}] { display: none !important; }
      [${PRINT_ONLY_ATTR}] { display: block !important; }
    </style>
  </head>
  <body>${node.outerHTML}</body>
</html>`;

    document.body.appendChild(iframe);
  });

// html2canvas 1.4 can't parse modern CSS colours (Tailwind v4 emits oklch /
// color-mix), and throws on them. Resolve every colour it reads to plain
// rgba() on the cloned DOM before it renders.
const MODERN_COLOR = /(oklch|oklab|lab\(|lch\(|color-mix|color\()/i;
const COLOR_PROPS = [
  "color",
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "webkitTextFillColor",
  "webkitTextStrokeColor",
];

let colorCtx;
const toRgba = (css) => {
  colorCtx ||= Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", {
    willReadFrequently: true,
  });
  colorCtx.clearRect(0, 0, 1, 1);
  colorCtx.fillStyle = "#000";
  colorCtx.fillStyle = css;
  colorCtx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
};

const flattenModernColors = (clonedDoc, clonedRoot) => {
  const view = clonedDoc.defaultView;
  for (const el of [clonedRoot, ...clonedRoot.querySelectorAll("*")]) {
    // Not `instanceof`: html2canvas creates the clone in the parent window's
    // realm, so it never matches the iframe window's Element classes.
    if (el.nodeType !== Node.ELEMENT_NODE) continue;
    const computed = view.getComputedStyle(el);

    for (const prop of COLOR_PROPS) {
      const value = computed[prop];
      if (value && MODERN_COLOR.test(value)) el.style[prop] = toRgba(value);
    }

    // html2canvas renders inline SVGs as standalone images, where
    // `currentColor` can no longer inherit and falls back to black.
    if (el.localName === "svg") {
      const color = toRgba(computed.color);
      for (const attr of ["stroke", "fill"]) {
        if (el.getAttribute(attr) === "currentColor") el.setAttribute(attr, color);
      }
    }
  }
};

// Renders each direct child of `node` to an A4 PDF, in order. Children are
// placed whole where they fit; a child taller than a page is sliced across
// pages. `skip(child)` can leave a child out. html2canvas and jsPDF are heavy,
// so load them on use.
const renderElementToPdf = async (node, { skip } = {}) => {
  if (!node) throw new Error("Nothing to export");

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const gap = 4;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  await document.fonts?.ready;

  let cursorY = margin;

  for (const block of node.children) {
    if (block.hasAttribute(HIDE_ATTR) || skip?.(block)) continue;

    // Canvas-pixel offsets where slicing this block across pages is safe.
    // Measured on the clone, since that's where print-only content is shown.
    let safeCutsPx = [];

    const canvas = await html2canvas(block, {
      scale: PDF_SCALE,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      ignoreElements: (el) => el.hasAttribute?.(HIDE_ATTR),
      onclone: (clonedDoc, clonedBlock) => {
        flattenModernColors(clonedDoc, clonedBlock);
        for (const el of clonedBlock.querySelectorAll(`[${PRINT_ONLY_ATTR}]`)) el.style.display = "block";
        const top = clonedBlock.getBoundingClientRect().top;
        safeCutsPx = [...clonedBlock.querySelectorAll(`[${UNIT_ATTR}]`)].map(
          (unit) => (unit.getBoundingClientRect().bottom - top) * PDF_SCALE
        );
      },
    });

    const blockHeight = (canvas.height * contentWidth) / canvas.width;
    // addImage's "FAST" is Flate compression; the default embeds raw bitmaps (~10 MB per card).

    if (blockHeight <= contentHeight) {
      if (cursorY + blockHeight > pageHeight - margin) {
        pdf.addPage();
        cursorY = margin;
      }
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, cursorY, contentWidth, blockHeight, undefined, "FAST");
      cursorY += blockHeight + gap;
      continue;
    }

    // Taller than a page: start on a fresh page and slice it, ending each
    // slice at the last unit boundary that fits so no row/image is cut in half.
    if (cursorY > margin) {
      pdf.addPage();
      cursorY = margin;
    }
    const pxPerMm = canvas.width / contentWidth;
    const pagePx = Math.floor(contentHeight * pxPerMm);
    let offset = 0;
    while (offset < canvas.height) {
      let end = Math.min(offset + pagePx, canvas.height);
      if (end < canvas.height) {
        const safeCut = safeCutsPx.filter((cut) => cut > offset && cut <= end).pop();
        if (safeCut) end = Math.round(safeCut);
      }
      const sliceHeightPx = end - offset;
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceHeightPx;
      slice.getContext("2d").drawImage(canvas, 0, offset, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
      if (offset > 0) pdf.addPage();
      pdf.addImage(slice.toDataURL("image/png"), "PNG", margin, margin, contentWidth, sliceHeightPx / pxPerMm, undefined, "FAST");
      cursorY = margin + sliceHeightPx / pxPerMm + gap;
      offset = end;
    }
  }

  return pdf;
};

export const downloadElementAsPdf = async (node, filename, options) => {
  const pdf = await renderElementToPdf(node, options);
  pdf.save(filename);
};

// Same render, handed back as a file instead of saved.
export const elementToPdfBlob = async (node, options) => {
  const pdf = await renderElementToPdf(node, options);
  return pdf.output("blob");
};
