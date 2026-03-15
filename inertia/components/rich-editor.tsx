import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo, Strikethrough } from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichEditor({ value, onChange, placeholder = 'Write something…', minHeight = 160 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rich-editor-area',
        style: `min-height:${minHeight}px`,
      },
    },
  }, []) // empty dep array — controlled via value prop on mount only

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
        background: active ? 'var(--p-lt)' : 'transparent',
        color: active ? 'var(--p)' : 'var(--text3)',
        transition: 'background .15s, color .15s',
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text1)' } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)' } }}
    >
      {children}
    </button>
  )

  const sep = <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 3px' }} />

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden', background: 'var(--surface)' }}>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '5px 8px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexWrap: 'wrap' }}>
        {btn(editor.isActive('bold'),          () => editor.chain().focus().toggleBold().run(),          'Bold',          <Bold size={13} />)}
        {btn(editor.isActive('italic'),        () => editor.chain().focus().toggleItalic().run(),        'Italic',        <Italic size={13} />)}
        {btn(editor.isActive('strike'),        () => editor.chain().focus().toggleStrike().run(),        'Strikethrough', <Strikethrough size={13} />)}
        {sep}
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Heading', <Heading2 size={13} />)}
        {sep}
        {btn(editor.isActive('bulletList'),    () => editor.chain().focus().toggleBulletList().run(),    'Bullet list',   <List size={13} />)}
        {btn(editor.isActive('orderedList'),   () => editor.chain().focus().toggleOrderedList().run(),   'Ordered list',  <ListOrdered size={13} />)}
        {sep}
        {btn(false, () => editor.chain().focus().undo().run(), 'Undo', <Undo size={13} />)}
        {btn(false, () => editor.chain().focus().redo().run(), 'Redo', <Redo size={13} />)}
      </div>

      {/* ── Content ── */}
      <EditorContent editor={editor} />

      <style>{`
        .rich-editor-area {
          padding: 12px 14px;
          outline: none;
          font-size: .84rem;
          line-height: 1.65;
          color: var(--text1);
        }
        .rich-editor-area p { margin: 0 0 .5em; }
        .rich-editor-area p:last-child { margin-bottom: 0; }
        .rich-editor-area h2 { font-size: .95rem; font-weight: 700; color: var(--text1); margin: .75em 0 .35em; }
        .rich-editor-area h3 { font-size: .87rem; font-weight: 700; color: var(--text1); margin: .6em 0 .3em; }
        .rich-editor-area ul, .rich-editor-area ol { padding-left: 1.4em; margin: .4em 0; }
        .rich-editor-area li { margin-bottom: .2em; }
        .rich-editor-area strong { font-weight: 700; }
        .rich-editor-area em { font-style: italic; }
        .rich-editor-area s { text-decoration: line-through; }
        .rich-editor-area .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text4);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
