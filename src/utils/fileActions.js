// Helpers for a file that exists only in the browser (an object URL, a data:
// URL, or a Blob built on demand). Everything is resolved to a Blob first, as
// browsers don't always honour a download name on a data: URL.

const EXTENSIONS = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

// "MRI Brain Images" + image/svg+xml -> "MRI Brain Images.svg". Names that
// already carry an extension (an uploaded "scan.png") are left alone.
export const withExtension = (name, mime) =>
  /\.[a-z0-9]{2,5}$/i.test(name) || !EXTENSIONS[mime] ? name : `${name}.${EXTENSIONS[mime]}`;

export const urlToBlob = async (url) => (await fetch(url)).blob();

export const saveBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
};
