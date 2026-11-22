/**
 * A multipart/form-data body's fields, read without `request.formData()`. Under jsdom (the
 * tests), Node's form parser rejects jsdom's `File` and throws, so mocks that take uploads read
 * the body with this instead. Text fields keep every value; file fields give their file names.
 */
export async function readMultipart(request: Request) {
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(request.headers.get("content-type") ?? "");
  const fields = new Map<string, string[]>();
  const files = new Map<string, string[]>();
  if (!boundary) return { get, getAll, fileNames };

  const body = new TextDecoder("latin1").decode(await request.arrayBuffer());
  for (const part of body.split(`--${boundary[1] ?? boundary[2]}`)) {
    const split = part.indexOf("\r\n\r\n");
    if (split === -1) continue;
    const headers = part.slice(0, split);
    const value = part.slice(split + 4).replace(/\r\n$/, "");
    const name = /name="([^"]*)"/.exec(headers)?.[1];
    if (!name) continue;
    const filename = /filename="([^"]*)"/.exec(headers)?.[1];
    const into = filename === undefined ? fields : files;
    into.set(name, [...(into.get(name) ?? []), filename ?? decodeUtf8(value)]);
  }
  return { get, getAll, fileNames };

  function get(name: string) {
    return fields.get(name)?.[0] ?? null;
  }
  function getAll(name: string) {
    return fields.get(name) ?? [];
  }
  function fileNames(name: string) {
    return files.get(name) ?? [];
  }
}

/** Text fields arrive as UTF-8 bytes; the body was decoded byte for byte. */
function decodeUtf8(latin1: string) {
  return new TextDecoder().decode(Uint8Array.from(latin1, (char) => char.charCodeAt(0)));
}
