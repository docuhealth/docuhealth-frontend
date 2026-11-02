import { FileTextIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Drop files on it or click "browse". It only collects files; check type/size/count with the
 * form's schema and pass any per-file messages back through `fileErrors` (same order as `files`).
 */
export function FileDropzone({
  id,
  files,
  onFilesChange,
  accept,
  hint,
  invalid,
  fileErrors,
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

  return (
    <div className="flex flex-col gap-3">
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
      </div>

      {files.length > 0 && (
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
