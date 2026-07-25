import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Heading2, Undo, Redo
} from "lucide-react";

const ToolbarButton = ({ onClick, active, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded transition-colors ${
      active ? "bg-docuhealth-primary text-white" : "text-gray-500 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ placeholder = "Start typing...", onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[100px] outline-none text-sm text-gray-700 leading-relaxed px-4 py-3",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-docuhealth-primary transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <Strikethrough size={14} />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
        >
          <Redo size={14} />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
