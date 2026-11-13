import { FileTextIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Drop files on it or click "browse". It only collects files; check type/size/count with the
 * form's schema and pass any per-file messages back through `fileErrors` (same order as `files`).
 * `layout="thumbnails"` makes the whole box the button and shows the chosen files as small
 * previews instead of a list, e.g. for scan images.
 */
export function FileDropzone({
  id,
  files,
  onFilesChange,
  accept,
  hint,
  invalid,
  fileErrors,
  layout = "list",
}: {
  id: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** Passed to the file input, e.g. ".pdf,.jpg,.jpeg,.png". */
  accept?: string;
  /** Allowed types/sizes, shown under the prompt. */
  hint: string;
  invalid?: boolean;
  fileErrors?: (string | undefined)[];
  layout?: "list" | "thumbnails";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function add(added: FileList | null) {
    if (added?.length) onFilesChange([...files, ...added]);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    add(event.dataTransfer.files);
  }

  const input = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      multiple
      accept={accept}
      aria-invalid={invalid}
      className="sr-only"
      tabIndex={-1}
      onChange={(event) => {
        add(event.target.files);
        // Let the same file be picked again after it's removed.
        event.target.value = "";
      }}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {layout === "thumbnails" ? (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex flex-col items-center gap-3 rounded-md border border-dashed border-fg-caption/40 bg-card px-6 py-8 text-center transition-colors outline-none hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50",
              dragging && "border-primary bg-primary/5",
              invalid && "border-destructive",
            )}
          >
            <span className="grid size-10 place-content-center rounded-md bg-line text-fg-body">
              <UploadSimpleIcon className="size-4.5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="type-body-sm-regular text-fg-caption">
                Drag and drop files here or click to upload
              </span>
              <span className="type-caption text-muted-foreground">{hint}</span>
            </span>
          </button>
          {input}
        </>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center gap-4 rounded-md border border-dashed border-fg-caption/60 bg-card px-6 py-6 text-center transition-colors",
            dragging && "border-primary bg-primary/5",
            invalid && "border-destructive",
          )}
        >
          <span className="grid size-10 place-content-center rounded-full bg-secondary text-fg-body">
            <UploadSimpleIcon className="size-4.5" />
          </span>
          <div className="flex flex-col gap-2">
            <p className="type-heading-sm text-fg-heading">
              Drag files here or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-primary underline underline-offset-2"
              >
                browse
              </button>
            </p>
            <p className="type-caption text-muted-foreground">{hint}</p>
          </div>
          {input}
        </div>
      )}

      {layout === "thumbnails" && files.length > 0 && (
        <ul aria-label="Chosen files" className="flex flex-wrap gap-4 pt-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="relative flex w-24 flex-col gap-1"
            >
              <FileThumbnail file={file} invalid={!!fileErrors?.[index]} />
              {fileErrors?.[index] && (
                <p className="type-caption text-destructive">{fileErrors[index]}</p>
              )}
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                aria-label={`Remove ${file.name}`}
                className="absolute -top-2 -right-2 grid size-6 place-content-center rounded-full border bg-card text-error-500 shadow-xs transition-colors hover:bg-error-100"
              >
                <XIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {layout === "list" && files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className={cn(
                "flex items-center gap-3 rounded-md border bg-card px-3 py-2.5",
                fileErrors?.[index] && "border-destructive",
              )}
            >
              <FileTextIcon className="size-5 shrink-0 text-fg-caption" />
              <div className="min-w-0 flex-1">
                <p className="truncate type-body-sm text-fg-heading">{file.name}</p>
                <p
                  className={cn(
                    "type-caption",
                    fileErrors?.[index] ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {fileErrors?.[index] ?? formatSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                aria-label={`Remove ${file.name}`}
                className="grid size-7 place-content-center rounded-md text-fg-caption transition-colors hover:bg-muted hover:text-fg-body"
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A chosen file as a small square: the picture itself for an image, else its name. */
function FileThumbnail({ file, invalid }: { file: File; invalid: boolean }) {
  const isImage = file.type.startsWith("image/");
  const imageRef = useRef<HTMLImageElement>(null);

  // The preview reads the file through a URL that has to be released when it changes.
  useEffect(() => {
    const image = imageRef.current;
    if (!isImage || !image) return;
    const url = URL.createObjectURL(file);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  return (
    <div
      title={`${file.name} (${formatSize(file.size)})`}
      className={cn(
        "grid size-24 place-content-center overflow-hidden rounded-md bg-line",
        invalid && "ring-2 ring-destructive",
      )}
    >
      {isImage ? (
        <img ref={imageRef} alt={file.name} className="size-24 object-cover" />
      ) : (
        <span className="flex flex-col items-center gap-1 px-2 text-center">
          <FileTextIcon className="size-6 text-fg-caption" />
          <span className="line-clamp-2 type-caption break-all text-fg-body">{file.name}</span>
        </span>
      )}
    </div>
  );
}
