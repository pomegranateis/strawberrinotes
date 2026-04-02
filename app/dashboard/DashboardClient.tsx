'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { Note, Todo } from '@/types'
import { useUser } from '@clerk/nextjs'

export default function DashboardClient({ userId }: { userId: string }) {
  const { user } = useUser()
  const [notes, setNotes]   = useState<Note[]>([])
  const [todos, setTodos]   = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: n }, { data: t }] = await Promise.all([
        supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(5),
        supabase.from('todos').select('*').eq('user_id', userId).eq('completed', false).order('created_at', { ascending: false }).limit(6),
      ])
      if (n) setNotes(n)
      if (t) setTodos(t)
      setLoading(false)
    }
    load()
  }, [userId])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.firstName ?? 'there'

  const publicCount = notes.filter(n => n.is_public).length

  async function toggleTodo(id: string, completed: boolean) {
    await supabase.from('todos').update({ completed }).eq('id', id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const PRIORITY_DOT: Record<string, string> = {
    high:   'bg-pink-400',
    medium: 'bg-pink-300',
    low:    'bg-pink-100 border border-pink-200',
  }

  const NOTE_ACCENT: Record<string, string> = {
    pink:     'bg-pink-300',
    lavender: 'bg-purple-300',
    mint:     'bg-green-300',
    peach:    'bg-orange-300',
    sky:      'bg-sky-300',
    rose:     'bg-rose-300',
    cream:    'bg-pink-200',
  }

  return (
    <div className="flex-1 overflow-auto p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[26px] text-[#4a2d35]">
          {greeting}, <em className="text-pink-400 not-italic">{firstName}</em> ✦
        </h1>
        <p className="text-[13px] text-[#9e7580] mt-1">
          {todos.length > 0 ? `You have ${todos.length} pending tasks today.` : 'All caught up — have a lovely day! 🌸'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {[
          { icon: '📝', num: notes.length,  label: 'Notes total',    href: '/notes' },
          { icon: '✅', num: todos.length,  label: 'Tasks pending',  href: '/todo' },
          { icon: '🔗', num: publicCount,   label: 'Shared publicly', href: '/notes' },
          { icon: '🌸', num: 7,             label: 'Day streak',      href: '/dashboard' },
        ].map(s => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white border border-pink-100 rounded-2xl p-4 hover:border-pink-300 hover:shadow-petal transition-all hover:-translate-y-0.5 cursor-pointer">
              <div className="text-xl mb-2">{s.icon}</div>
              <div className="font-serif text-2xl text-[#4a2d35]">{s.num}</div>
              <div className="text-[11px] text-[#9e7580] mt-0.5">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* Left col */}
        <div className="flex flex-col gap-5">

          {/* Recent notes */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-[#4a2d35]">Recent Notes</span>
              <Link href="/notes" className="text-[11px] text-pink-400 hover:text-pink-500">View all →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-pink-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-[#c4a0ac] text-[13px]">
                No notes yet —{' '}
                <Link href="/notes/new" className="text-pink-400 hover:underline">create your first one</Link>
              </div>
            ) : (
              <div>
                {notes.map(note => (
                  <Link key={note.id} href={`/notes/${note.id}`}>
                    <div className="flex items-start gap-3 py-2.5 border-b border-[#f5eff0] last:border-0 hover:bg-pink-50 hover:mx-[-8px] hover:px-2 rounded-xl transition-all cursor-pointer">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${NOTE_ACCENT[note.color] ?? 'bg-pink-300'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-[#4a2d35] truncate">{note.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${note.is_public ? 'bg-green-50 text-green-700' : 'bg-pink-50 text-[#9e7580]'}`}>
                            {note.is_public ? 'public' : 'private'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#9e7580] mt-0.5">{formatDate(note.updated_at)} · {note.word_count} words</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick capture */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5" style={{ backgroundImage: 'radial-gradient(circle, #ffc2d1 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
            <div className="text-[13px] font-medium text-[#4a2d35] mb-3">Quick capture 🌸</div>
            <textarea
              placeholder="Jot something down..."
              className="w-full bg-white border border-pink-100 rounded-xl p-3 text-[13px] text-[#4a2d35] placeholder:text-[#c4a0ac] outline-none resize-none leading-relaxed min-h-[80px] focus:border-pink-300 transition-colors"
            />
            <Link href="/notes/new">
              <button className="mt-2 w-full py-2 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all">
                Save as note →
              </button>
            </Link>
          </div>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-5">

          {/* Today's tasks */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-[#4a2d35]">Today's Tasks</span>
              <Link href="/todo" className="text-[11px] text-pink-400 hover:text-pink-500">All tasks →</Link>
            </div>
            {todos.length === 0 ? (
              <div className="text-center py-6 text-[#c4a0ac] text-[12px]">All done! 🌸</div>
            ) : (
              <div>
                {todos.slice(0, 5).map(todo => (
                  <div key={todo.id} className="flex items-center gap-3 py-2 border-b border-[#f5eff0] last:border-0">
                    <button
                      onClick={() => toggleTodo(todo.id, true)}
                      className="w-4 h-4 rounded-full border-[1.5px] border-pink-300 hover:bg-pink-300 hover:border-pink-300 transition-all flex items-center justify-center shrink-0"
                    />
                    <span className="flex-1 text-[13px] text-[#4a2d35] truncate">{todo.title}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[todo.priority]}`} />
                  </div>
                ))}
              </div>
            )}
            <Link href="/todo">
              <button className="mt-3 w-full py-2 rounded-full border border-pink-100 text-[12px] text-[#9e7580] hover:bg-pink-50 transition-colors">
                + Add task
              </button>
            </Link>
          </div>

          {/* Mini timetable */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-[#4a2d35]">Timetable</span>
              <Link href="/timetable" className="text-[11px] text-pink-400 hover:text-pink-500">Full view →</Link>
            </div>
            <div className="grid grid-cols-6 gap-1 text-[10px]">
              <div />
              {['M','T','W','T','F'].map((d, i) => (
                <div key={i} className="text-center text-[#9e7580] font-medium py-1">{d}</div>
              ))}
              {[
                { t:'8am',  cells:['Algo','','Algo','',''] },
                { t:'10am', cells:['','Cyber','','Cyber',''] },
                { t:'2pm',  cells:['','','DB','','Math'] },
              ].map(row => (
                <>
                  <div key={row.t} className="text-[#c4a0ac] text-right pr-1 flex items-center justify-end">{row.t}</div>
                  {row.cells.map((c, i) => (
                    <div key={i} className={`text-center py-1.5 rounded text-[9px] ${c ? 'bg-pink-100 text-[#4a2d35]' : ''}`}>{c}</div>
                  ))}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
