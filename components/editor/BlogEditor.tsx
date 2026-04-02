'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import Document       from '@tiptap/extension-document'
import Paragraph      from '@tiptap/extension-paragraph'
import Text           from '@tiptap/extension-text'
import Bold           from '@tiptap/extension-bold'
import Italic         from '@tiptap/extension-italic'
import Underline      from '@tiptap/extension-underline'
import Strike         from '@tiptap/extension-strike'
import Heading        from '@tiptap/extension-heading'
import BulletList     from '@tiptap/extension-bullet-list'
import OrderedList    from '@tiptap/extension-ordered-list'
import ListItem       from '@tiptap/extension-list-item'
import CodeBlock      from '@tiptap/extension-code-block'
import Code           from '@tiptap/extension-code'
import HardBreak      from '@tiptap/extension-hard-break'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Image          from '@tiptap/extension-image'
import Link           from '@tiptap/extension-link'
import History        from '@tiptap/extension-history'
import Placeholder    from '@tiptap/extension-placeholder'
import Table          from '@tiptap/extension-table'
import TableRow       from '@tiptap/extension-table-row'
import TableHeader    from '@tiptap/extension-table-header'
import TableCell      from '@tiptap/extension-table-cell'
import { marked }     from 'marked'
import type { BlogPost } from '@/types'
import toast from 'react-hot-toast'
import { Bold as BoldIcon, Italic as ItalicIcon, Heading2, List, Code as CodeIcon, ImagePlus, X } from 'lucide-react'

interface Props {
  post?: BlogPost
}

function looksLikeMarkdown(text: string) {
  return /^#{1,6}\s|\*\*|^[-*+]\s|\|.+\|/m.test(text)
}

export default function BlogEditor({ post }: Props) {
  const router           = useRouter()
  const editorRef        = useRef<Editor | null>(null)
  const contentRef       = useRef<string>(post?.content ?? '')
  const coverFileRef     = useRef<HTMLInputElement>(null)
  const [title,      setTitle]      = useState(post?.title ?? '')
  const [excerpt,    setExcerpt]    = useState(post?.excerpt ?? '')
  const [tags,       setTags]       = useState<string[]>(post?.tags ?? [])
  const [tagInput,   setTagInput]   = useState('')
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '')
  const [saving,     setSaving]     = useState(false)
  const [uploading,  setUploading]  = useState(false)

  const editor = useEditor({
    extensions: [
      Document, Paragraph, Text, Bold, Italic, Underline, Strike,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList, OrderedList, ListItem,
      CodeBlock, Code, HardBreak, HorizontalRule,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      History,
      Placeholder.configure({ placeholder: 'Start writing… or paste Markdown directly.' }),
      Table.configure({ resizable: false }),
      TableRow, TableHeader, TableCell,
    ],
    content: post?.content ?? '',
    onUpdate: ({ editor }) => { contentRef.current = editor.getHTML() },
    editorProps: {
      handlePaste(_view, event) {
        const text = event.clipboardData?.getData('text/plain') ?? ''
        if (!looksLikeMarkdown(text)) return false
        event.preventDefault()
        const html = marked.parse(text) as string
        editorRef.current?.commands.insertContent(html)
        return true
      },
    },
  })

  editorRef.current = editor

  async function uploadCoverImage(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Upload failed'); return }
      setCoverImage(json.url)
      toast.success('Cover image uploaded')
    } catch (err) {
      console.error('Cover upload error:', err)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase()
      if (!tags.includes(t)) setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  async function save() {
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    const body = {
      title:       title.trim(),
      content:     contentRef.current,
      excerpt:     excerpt.trim() || null,
      tags,
      status:      'published' as const,
      cover_image: coverImage.trim() || null,
    }
    try {
      const res = post
        ? await fetch(`/api/blog/${post.slug}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/blog',               { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Failed') }
      const saved: BlogPost = await res.json()
      toast.success(post ? 'Updated ✦' : 'Published ✦')
      if (!post) router.push(`/dashboard/posts/${saved.id}/edit`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-[#fdf8f5] to-pink-50/30">

      {/* Toolbar — sits below PublicNav (56px) */}
      <div className="sticky top-14 z-20 bg-white/80 backdrop-blur-sm border-b border-pink-100 px-6 py-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <ToolBtn active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold">
            <BoldIcon size={13} />
          </ToolBtn>
          <ToolBtn active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic">
            <ItalicIcon size={13} />
          </ToolBtn>
          <ToolBtn active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
            <Heading2 size={13} />
          </ToolBtn>
          <ToolBtn active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="List">
            <List size={13} />
          </ToolBtn>
          <ToolBtn active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="Code block">
            <CodeIcon size={13} />
          </ToolBtn>
        </div>

        <div className="flex-1" />

        <button
          onClick={save}
          disabled={saving || uploading}
          className="flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all hover:scale-105 font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : post ? 'Update ✦' : 'Publish ✦'}
        </button>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post title…"
          className="w-full font-serif text-3xl text-[#4a2d35] placeholder:text-pink-200 bg-transparent outline-none mb-4 border-b border-pink-100 pb-3 focus:border-pink-300 transition-colors"
        />

        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Short excerpt (optional)…"
          rows={2}
          className="w-full text-[13px] text-[#9e7580] placeholder:text-[#c4a0ac] bg-transparent outline-none mb-4 border-b border-pink-50 pb-2 focus:border-pink-200 transition-colors resize-none leading-relaxed"
        />

        <div className="flex flex-wrap gap-1.5 items-center mb-6">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-500 text-[11px] border border-pink-100">
              {tag}
              <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-400 transition-colors">
                <X size={9} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Add tag…"
            className="text-[12px] text-[#9e7580] placeholder:text-[#c4a0ac] bg-transparent outline-none min-w-[80px]"
          />
        </div>

        {/* Cover image — upload from device or paste URL */}
        <div className="mb-6">
          {coverImage ? (
            <div className="relative group">
              <img src={coverImage} alt="Cover" className="rounded-2xl max-h-48 object-cover w-full" />
              <button
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-[#9e7580] hover:text-red-400 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-pink-200 rounded-2xl p-5">
              <p className="text-[11px] text-[#c4a0ac] uppercase tracking-[0.12em] mb-3">Cover Image</p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => coverFileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 border border-pink-100 text-[12px] text-[#9e7580] hover:bg-pink-100 hover:text-[#4a2d35] transition-all disabled:opacity-50"
                >
                  <ImagePlus size={13} />
                  {uploading ? 'Uploading…' : 'Upload from device'}
                </button>
                <span className="text-[11px] text-[#c4a0ac]">or</span>
                <input
                  type="text"
                  placeholder="Paste image URL…"
                  onBlur={e => { if (e.target.value.trim()) setCoverImage(e.target.value.trim()) }}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) setCoverImage((e.target as HTMLInputElement).value.trim()) }}
                  className="flex-1 min-w-[160px] text-[12px] text-[#9e7580] placeholder:text-[#c4a0ac] bg-transparent outline-none border-b border-pink-100 pb-1 focus:border-pink-300 transition-colors"
                />
              </div>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadCoverImage(f); e.target.value = '' }}
              />
            </div>
          )}
        </div>

        {/* Content editor */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-pink-100 p-5 min-h-[400px]">
          <EditorContent editor={editor} className="blog-editor-content" />
        </div>
      </div>
    </div>
  )
}

function ToolBtn({ children, active, onClick, title }: {
  children: React.ReactNode; active?: boolean; onClick: () => void; title: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-pink-100 text-[#4a2d35]' : 'text-[#9e7580] hover:bg-pink-50 hover:text-[#4a2d35]'}`}
    >
      {children}
    </button>
  )
}
