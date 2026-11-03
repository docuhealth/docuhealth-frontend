import {
  type Icon,
  ListChecksIcon,
  ListNumbersIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { CharacterCount } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect } from "react";
import { MESSAGE_LIMIT } from "@/features/hospital-admin/lib/welcome-message";
import { cn } from "@/lib/utils";

/**
 * A small rich-text box (bold, italic, underline, numbered and check lists) with a character
 * count, for messages we email. `value` is HTML; replacing it from outside (e.g. refilling a
 * template) doesn't call `onChange`, so `onChange` only ever means the person typed.
 */
export function MessageEditor({
  value,
  onChange,
  onBlur,
  labelledBy,
  invalid,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur: () => void;
  /** The id of the field's label. */
  labelledBy: string;
  invalid: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, link: false, code: false, codeBlock: false }),
      TaskList,
      TaskItem.configure({ nested: false }),
      CharacterCount.configure({ limit: MESSAGE_LIMIT }),
    ],
    content: value,
    editorProps: { attributes: editableAttributes(labelledBy, invalid) },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur,
  });

  // Take in outside changes (a refilled template) without echoing them back as typing.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  // Keep the label and invalid state on the editable element as they change.
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: editableAttributes(labelledBy, invalid) } });
  }, [editor, labelledBy, invalid]);

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      underline: current?.isActive("underline") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      taskList: current?.isActive("taskList") ?? false,
      characters: current?.storage.characterCount.characters() ?? 0,
    }),
  });

  const tools: { label: string; icon: Icon; active: boolean; run: () => void }[] = [
    {
      label: "Bold",
      icon: TextBIcon,
      active: !!state?.bold,
      run: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: TextItalicIcon,
      active: !!state?.italic,
      run: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: TextUnderlineIcon,
      active: !!state?.underline,
      run: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Numbered list",
      icon: ListNumbersIcon,
      active: !!state?.orderedList,
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Checklist",
      icon: ListChecksIcon,
      active: !!state?.taskList,
      run: () => editor?.chain().focus().toggleTaskList().run(),
    },
  ];

  return (
    <div
      data-invalid={invalid || undefined}
      className={cn(
        "flex flex-col gap-3 rounded-md border border-input bg-card p-4 transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        "data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20",
        // The document: 14px text, a line's gap between paragraphs, numbered and check lists.
        "type-body-sm-regular text-fg-heading",
        "[&_.tiptap_p:not(:last-child)]:mb-4 [&_.tiptap_strong]:font-semibold",
        "[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5",
        "[&_ul[data-type=taskList]]:flex [&_ul[data-type=taskList]]:flex-col [&_ul[data-type=taskList]]:gap-1",
        "[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-start [&_ul[data-type=taskList]_li]:gap-2",
        "[&_ul[data-type=taskList]_input]:accent-primary [&_ul[data-type=taskList]_label]:mt-0.5",
      )}
    >
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2" role="toolbar" aria-label="Formatting">
          {tools.map(({ label, icon: ToolIcon, active, run }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-pressed={active}
              onClick={run}
              className={cn(
                "grid size-7 place-content-center rounded-md transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "bg-primary/10 text-primary"
                  : "bg-line text-fg-body hover:text-fg-heading",
              )}
            >
              <ToolIcon className="size-3.5" />
            </button>
          ))}
        </div>
        <span className="type-caption text-fg-caption tabular-nums">
          {state?.characters ?? 0}/{MESSAGE_LIMIT}
        </span>
      </div>
    </div>
  );
}

/** What screen readers and styles see on the editable element. */
function editableAttributes(labelledBy: string, invalid: boolean) {
  return {
    role: "textbox",
    "aria-multiline": "true",
    "aria-labelledby": labelledBy,
    "aria-invalid": String(invalid),
    class: "min-h-40 outline-none",
  };
}
