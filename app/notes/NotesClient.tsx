'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatDate, NOTE_COLORS } from '@/lib/utils'
import type { Note } from '@/types'
import { Plus, Search } from 'lucide-react'

const FILTERS = ['All', 'Public', 'Private', 'Starred'] as const
type Filter = typeof FILTERS[number]

const COLORS = ['pink', 'lavender', 'mint', 'peach', 'sky', 'rose', 'cream']

export default function NotesClient({ userId }: { userId: string }) {
  const searchParams  = useSearchParams()
  const [notes, setNotes]     = useState<Note[]>([])
  const [filter, setFilter]   = useState<Filter>('All')
  const [search, setSearch]   = useState(searchParams.get('search') ?? '')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
    if (filter === 'Public')  q = q.eq('is_public', true)
    if (filter === 'Private') q = q.eq('is_public', false)

    // Enhanced search: search in title, content, and tags
    if (search.trim()) {
      const searchTerm = `%${search.trim()}%`
      q = q.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
    }

    const { data } = await q

    // Additional client-side filtering for tags (since Supabase doesn't support array search in .or())
    let filteredData = data ?? []
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase()
      filteredData = filteredData.filter(note =>
        note.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
      )
    }

    setNotes(filteredData)
    setLoading(false)
  }, [userId, filter, search])

  useEffect(() => { load() }, [load])

  async function deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="flex-1 overflow-auto p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-[22px] text-[#4a2d35]">📝 My Notes</h2>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#f5eff0] border border-pink-100 rounded-full px-3 py-1.5 text-[12px] focus-within:border-pink-300 focus-within:bg-white transition-all">
            <Search size={11} className="text-[#9e7580]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent outline-none text-[#4a2d35] placeholder:text-[#c4a0ac] w-28"
            />
          </div>
          {/* Filters */}
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] border transition-all ${
                filter === f
                  ? 'bg-pink-100 border-pink-300 text-[#4a2d35]'
                  : 'bg-transparent border-pink-100 text-[#9e7580] hover:bg-pink-50'
              }`}
            >
              {f}
            </button>
          ))}
          <Link href="/notes/new">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all hover:scale-105">
              <Plus size={12} /> New
            </button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-white border border-pink-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-[#c4a0ac]">
          <div className="text-4xl mb-3">🌸</div>
          <div className="text-[14px]">{search ? 'No notes match your search.' : 'No notes yet.'}</div>
          <Link href="/notes/new">
            <button className="mt-4 px-6 py-2.5 rounded-full bg-pink-200 text-[#4a2d35] text-[13px] hover:bg-pink-300 transition-all">
              Create your first note
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map(note => {
            const colors = NOTE_COLORS[note.color] ?? NOTE_COLORS.pink
            return (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <div className="group bg-white border border-pink-100 rounded-2xl p-5 hover:border-pink-300 hover:shadow-petal transition-all hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                  <div className={`h-1 rounded-full bg-gradient-to-r ${colors.accent} mb-4`} />
                  <div className="font-serif text-[15px] text-[#4a2d35] mb-2 line-clamp-2">{note.title || 'Untitled'}</div>
                  <div className="text-[12px] text-[#9e7580] leading-relaxed line-clamp-3 flex-1">
                    {note.content.replace(/<[^>]*>/g, '') || 'No content yet...'}
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-3">
                      {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-[#9e7580] border border-pink-100">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 text-[10px] text-[#c4a0ac]">
                    <span>{formatDate(note.updated_at)}</span>
                    <span>{note.is_public ? '🌐 public' : '🔒 private'}</span>
                  </div>
                </div>
              </Link>
            )
          })}

          {/* New note card */}
          <Link href="/notes/new">
            <div className="border-2 border-dashed border-pink-200 rounded-2xl flex items-center justify-center flex-col gap-2 min-h-[180px] hover:border-pink-300 hover:bg-pink-50 transition-all cursor-pointer text-[#c4a0ac] hover:text-pink-400">
              <span className="text-2xl">✦</span>
              <span className="text-[13px]">New note</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
