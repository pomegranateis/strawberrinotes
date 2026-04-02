'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import Document    from '@tiptap/extension-document'
import Paragraph   from '@tiptap/extension-paragraph'
import Text        from '@tiptap/extension-text'
import Bold        from '@tiptap/extension-bold'
import Italic      from '@tiptap/extension-italic'
import Underline   from '@tiptap/extension-underline'
import Strike      from '@tiptap/extension-strike'
import Heading     from '@tiptap/extension-heading'
import BulletList  from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem    from '@tiptap/extension-list-item'
import TaskList    from '@tiptap/extension-task-list'
import TaskItem    from '@tiptap/extension-task-item'
import CodeBlock   from '@tiptap/extension-code-block'
import Code        from '@tiptap/extension-code'
import Blockquote  from '@tiptap/extension-hard-break'
import HardBreak   from '@tiptap/extension-hard-break'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Image       from '@tiptap/extension-image'
import Link        from '@tiptap/extension-link'
import History     from '@tiptap/extension-history'
import Placeholder from '@tiptap/extension-placeholder'
import { supabase } from '@/lib/supabase'
import { wordCount } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Copy, Link2, Trash2 } from 'lucide-react'
import ImageInsertDialog from '@/components/editor/ImageInsertDialog'

const COLORS = ['pink', 'lavender', 'mint', 'peach', 'sky', 'rose', 'cream']
const COLOR_DOTS: Record<string, string> = {
  pink: 'bg-pink-300', lavender: 'bg-purple-300', mint: 'bg-green-300',
  peach: 'bg-orange-300', sky: 'bg-sky-300', rose: 'bg-rose-300', cream: 'bg-pink-100',
}

interface Props { userId: string; noteId: string | null }

export default function NoteEditorClient({ userId, noteId }: Props) {
  const router = useRouter()
  const [title,    setTitle]    = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [color,    setColor]    = useState('pink')
  const [tags,     setTags]     = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(true)
  const [id,       setId]       = useState<string | null>(noteId)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const saveTimer = useRef<NodeJS.Timeout>()

  const editor = useEditor({
    extensions: [
      Document, Paragraph, Text, Bold, Italic, Underline, Strike,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList, OrderedList, ListItem,
      TaskList, TaskItem.configure({ nested: true }),
      CodeBlock, Code, HardBreak, HorizontalRule,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      History,
      Placeholder.configure({ placeholder: 'Start writing… (supports Markdown shortcuts)' }),
    ],
    content: '',
    onUpdate: () => {
      setSaved(false)
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => autoSave(), 1500)
    },
  })

  // Load existing note
  useEffect(() => {
    if (!noteId) return
    supabase.from('notes').select('*').eq('id', noteId).single().then(({ data }) => {
      if (!data) return
      setTitle(data.title)
      setIsPublic(data.is_public)
      setColor(data.color)
      setTags(data.tags ?? [])
      editor?.commands.setContent(data.content)
    })
  }, [noteId, editor])

  const autoSave = useCallback(async () => {
    if (!editor) return
    setSaving(true)
    const content = editor.getHTML()
    const wc = wordCount(content)

    if (id) {
      await supabase.from('notes').update({ title: title || 'Untitled', content, is_public: isPublic, color, tags, word_count: wc, updated_at: new Date().toISOString() }).eq('id', id)
    } else {
      const { data } = await supabase.from('notes').insert({ user_id: userId, title: title || 'Untitled', content, is_public: isPublic, color, tags, word_count: wc }).select().single()
      if (data) setId(data.id)
    }
    setSaving(false)
    setSaved(true)
  }, [editor, id, title, isPublic, color, tags, userId])

  async function handleSave() {
    await autoSave()
    toast.success('Note saved! 🌸')
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm('Delete this note?')) return
    await supabase.from('notes').delete().eq('id', id)
    toast.success('Note deleted')
    router.push('/notes')
  }

  async function handleShare() {
    if (!id) {
      toast.error('Please save the note first')
      return
    }

    // Make note public
    setIsPublic(true)
    setSaved(false)

    // Save the note with public status
    await autoSave()

    // Copy share link
    const url = `${window.location.origin}/share/${id}`
    navigator.clipboard.writeText(url)
    toast.success('Note is now public! Link copied 🔗')
  }

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      const t = tagInput.trim().toLowerCase()
      if (!tags.includes(t)) setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  if (!editor) return null

  const ToolBtn = ({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-[12px] transition-all hover:bg-pink-100 ${active ? 'bg-pink-100 text-[#4a2d35]' : 'text-[#9e7580]'}`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-1 overflow-hidden animate-fade-in">
      {/* Editor */}
      <div className="flex-1 flex flex-col border-r border-pink-100 min-w-0">

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-pink-100 flex-wrap bg-white">
          <ToolBtn active={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolBtn>
          <ToolBtn active={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolBtn>
          <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></ToolBtn>
          <ToolBtn active={editor.isActive('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolBtn>
          <span className="w-px h-4 bg-pink-100 mx-1" />
          <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolBtn>
          <span className="w-px h-4 bg-pink-100 mx-1" />
          <ToolBtn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}>≡ List</ToolBtn>
          <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolBtn>
          <ToolBtn active={editor.isActive('taskList')}    onClick={() => editor.chain().focus().toggleTaskList().run()}>☑ Tasks</ToolBtn>
          <ToolBtn active={editor.isActive('codeBlock')}   onClick={() => editor.chain().focus().toggleCodeBlock().run()}>⌐ Code</ToolBtn>
          <span className="w-px h-4 bg-pink-100 mx-1" />
          <ToolBtn onClick={() => setShowImageDialog(true)}>🖼 Image</ToolBtn>
          <ToolBtn onClick={() => {
            const url = prompt('Link URL:')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}>🔗 Link</ToolBtn>
        </div>

        {/* Title */}
        <div className="px-8 pt-7 pb-2">
          <textarea
            value={title}
            onChange={e => { setTitle(e.target.value); setSaved(false) }}
            placeholder="Untitled note..."
            rows={1}
            className="w-full font-serif text-[28px] text-[#4a2d35] bg-transparent border-none outline-none resize-none leading-snug placeholder:text-[#c4a0ac]"
          />
        </div>

        {/* Tags bar */}
        <div className="px-8 pb-3 flex items-center gap-2 flex-wrap">
          {tags.map(tag => (
            <span
              key={tag}
              onClick={() => setTags(prev => prev.filter(t => t !== tag))}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-50 text-[#9e7580] border border-pink-100 cursor-pointer hover:bg-red-50 hover:text-red-400 transition-colors"
            >
              {tag} ×
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="+ add tag"
            className="text-[11px] text-pink-400 bg-transparent outline-none placeholder:text-pink-300 w-20"
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-8 pb-8">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Sidebar panel */}
      <aside className="w-52 flex flex-col gap-5 p-5 bg-white overflow-auto shrink-0">

        {/* Share */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#c4a0ac] mb-2">Share</div>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 w-full bg-[#f5eff0] border border-pink-100 rounded-lg px-2.5 py-2 text-[12px] text-[#4a2d35] hover:border-pink-300 hover:bg-pink-50 transition-colors"
          >
            <Link2 size={13} /> {isPublic ? 'Copy share link' : 'Share note'}
          </button>
          {isPublic && (
            <div className="mt-2 text-[10px] text-green-600 bg-green-50 rounded px-2 py-1 text-center">
              ✓ Public
            </div>
          )}
        </div>

        {/* Color */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#c4a0ac] mb-2">Color</div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setSaved(false) }}
                className={`w-5 h-5 rounded-full transition-all ${COLOR_DOTS[c]} ${color === c ? 'ring-2 ring-pink-400 ring-offset-1 scale-110' : 'hover:scale-110'}`}
              />
            ))}
          </div>
        </div>

        {/* Word count / status */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#c4a0ac] mb-2">Status</div>
          <div className={`flex items-center gap-1.5 text-[11px] ${saved ? 'text-green-500' : saving ? 'text-orange-400' : 'text-[#c4a0ac]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${saved ? 'bg-green-400' : saving ? 'bg-orange-300 animate-pulse-soft' : 'bg-pink-200'}`} />
            {saving ? 'Saving...' : saved ? 'Saved' : 'Unsaved'}
          </div>
          <div className="text-[11px] text-[#c4a0ac] mt-1">
            {wordCount(editor.getHTML())} words
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-pink-100 pt-4 flex flex-col gap-2">
          <button onClick={handleSave} className="w-full py-2 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all">
            Save note
          </button>
          <button
            onClick={() => router.push(`/notes/${id ?? 'new'}`)}
            className="w-full py-2 rounded-full border border-pink-100 text-[#9e7580] text-[12px] hover:bg-pink-50 transition-colors"
          >
            Preview
          </button>
          {id && (
            <button onClick={handleDelete} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-full border border-red-100 text-red-400 text-[12px] hover:bg-red-50 transition-colors">
              <Trash2 size={11} /> Delete
            </button>
          )}
        </div>
      </aside>

      {/* Image Insert Dialog */}
      {showImageDialog && (
        <ImageInsertDialog
          isOpen={showImageDialog}
          onClose={() => setShowImageDialog(false)}
          onInsert={(url) => {
            if (editor) {
              editor.chain().focus().setImage({ src: url }).run()
              setShowImageDialog(false)
              toast.success('Image inserted! 🖼️')
            }
          }}
          userId={userId}
        />
      )}
    </div>
  )
}
