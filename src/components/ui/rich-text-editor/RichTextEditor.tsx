"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import type { Editor } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "./rich-text-editor.css";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const HEADING_LEVELS = [1, 2, 3, 4] as const;

/** Plain text or empty → valid block HTML so TipTap always parses. */
function toEditorHtml(raw: string | undefined | null): string {
  const v = String(raw ?? "").trim();
  if (!v) return "<p></p>";
  if (/^\s*</.test(v)) return v;
  const esc = v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<p>${esc.replace(/\r\n|\r|\n/g, "<br>")}</p>`;
}

function headingSelectValue(ed: Editor): string {
  for (const level of HEADING_LEVELS) {
    if (ed.isActive("heading", { level })) return String(level);
  }
  return "p";
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 ${
        active ? "bg-gray-200 dark:bg-gray-700" : ""
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const headingSelectId = useId();

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions: [
        StarterKit.configure({
          heading: { levels: [...HEADING_LEVELS] },
        }),
      ],
      content: toEditorHtml(value),
      editorProps: {
        attributes: {
          class:
            "rich-text-editor__content min-h-[10rem] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none",
        },
        handlePaste(_view, event) {
          const ed = editorRef.current;
          if (!ed) return false;
          const html = event.clipboardData?.getData("text/html");
          if (html && html.trim().length > 0) {
            event.preventDefault();
            ed.chain().focus().insertContent(html, { parseOptions: { preserveWhitespace: false } }).run();
            return true;
          }
          const plain = event.clipboardData?.getData("text/plain");
          if (plain && /^<\/?[a-z][\s\S]*>/i.test(plain.trim())) {
            event.preventDefault();
            ed.chain().focus().insertContent(plain.trim()).run();
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor: ed }) => {
        const html = ed.getHTML();
        const empty = html === "<p></p>" || html === "<p><br></p>";
        onChange(empty ? "" : html);
      },
    },
    []
  );

  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const next = toEditorHtml(value);
    const current = editor.getHTML();
    const curEmpty = current === "<p></p>" || current === "<p><br></p>";
    const nextEmpty = next === "<p></p>";
    if (curEmpty && nextEmpty) return;
    if (current === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      if (editorRef.current === editor) editorRef.current = null;
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="w-full min-h-[10rem] rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 animate-pulse" />
    );
  }

  const hVal = headingSelectValue(editor);

  return (
    <div className="rich-text-editor w-full rounded-lg border border-gray-300 shadow-theme-xs bg-transparent focus-within:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-brand-300">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800/80">
        <label className="sr-only" htmlFor={headingSelectId}>
          Heading
        </label>
        <select
          id={headingSelectId}
          className="h-8 min-w-[8.5rem] rounded border border-gray-300 bg-white px-2 text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          value={hVal}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .setHeading({ level: Number(v) as 1 | 2 | 3 | 4 })
                .run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>

        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
