import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function SharedNotePage({ params }: { params: { id: string } }) {
  const { data: note } = await supabase
    .from('notes')
    .select('*')
    .eq('id', params.id)
    .eq('is_public', true)
    .single()

  if (!note) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream to-rose-lace">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-pink-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-[#4a2d35]">
          <span>🍓</span>
          <span className="font-serif text-[15px]">Strawberries&Notes</span>
        </Link>
        <Link href="/sign-in">
          <button className="px-4 py-2 rounded-full bg-pink-200 text-[#4a2d35] text-[13px] hover:bg-pink-300 transition-all hover:scale-105">
            Login to write your own ✦
          </button>
        </Link>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Author + meta */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center text-[13px] text-white font-medium">
              ✦
            </div>
            <div>
              <div className="text-[13px] font-medium text-[#4a2d35]">Shared note</div>
              <div className="text-[11px] text-[#9e7580]">{formatDate(note.created_at)}</div>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
            🌐 public
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-[32px] text-[#4a2d35] leading-tight mb-4">
          {note.title}
        </h1>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex gap-2 mb-6">
            {note.tags.map((tag: string) => (
              <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-pink-50 text-[#9e7580] border border-pink-100">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Body */}
        <div
          className="prose-note text-[15px] text-[#4a2d35] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-pink-100 text-center">
          <p className="text-[13px] text-[#9e7580] mb-4">Like what you see? Start your own Strawberries&Notes.</p>
          <Link href="/sign-up">
            <button className="px-8 py-3 rounded-full bg-pink-200 text-[#4a2d35] text-[13px] hover:bg-pink-300 transition-all hover:scale-105 shadow-petal">
              Get started — it's free ✦
            </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
