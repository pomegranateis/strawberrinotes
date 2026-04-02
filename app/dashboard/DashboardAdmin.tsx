'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { formatDate, formatLongDate } from '@/lib/utils'
import type { BlogPost } from '@/types'
import { Plus, FileText, BookOpen, Edit3, Trash2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardAdmin() {
  const { user } = useUser()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.firstName ?? 'Admin'
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function deletePost(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts(prev => prev.filter(p => p.slug !== slug))
      toast.success('Post deleted')
    } else {
      toast.error('Failed to delete post')
    }
  }

  async function toggleStatus(post: BlogPost) {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/blog/${post.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPosts(prev => prev.map(p => p.slug === post.slug ? updated : p))
      toast.success(newStatus === 'published' ? 'Post published ✦' : 'Moved to drafts')
    } else {
      toast.error('Failed to update status')
    }
  }

  const totalPosts     = posts.length
  const publishedPosts = posts.filter(p => p.status === 'published').length
  const draftPosts     = posts.filter(p => p.status === 'draft').length
  const allTags        = Array.from(new Set(posts.flatMap(p => p.tags ?? [])))
  const tagCount       = allTags.length

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">

      {/* ── Welcome + Profile (combined) ─────────────────── */}
      <div className="glass-card rounded-3xl p-6 mb-5 glow-pink relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-pink-200/30 to-rose-300/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center text-white text-xl font-serif shrink-0 shadow-petal">
            {firstName[0]}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.18em] uppercase text-pink-400 mb-0.5">{dateStr}</p>
            <h1 className="font-serif text-[22px] text-[#4a2d35] leading-tight">
              Welcome back, <em className="text-pink-400 not-italic">{firstName}</em> ✦
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[12px] text-[#9e7580] truncate">{user?.primaryEmailAddress?.emailAddress}</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-200 to-rose-200 text-[#4a2d35] text-[10px] font-medium border border-pink-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse-soft" />
                Admin
              </span>
            </div>
          </div>
          {/* Draft notice */}
          <p className="text-[12px] text-[#9e7580] hidden md:block shrink-0">
            {draftPosts > 0 ? `${draftPosts} draft${draftPosts > 1 ? 's' : ''} unpublished` : 'All posts are live 🌸'}
          </p>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { icon: '📄', num: totalPosts,     label: 'Total Posts', color: 'from-pink-100 to-rose-100' },
          { icon: '🌐', num: publishedPosts, label: 'Published',   color: 'from-green-50 to-emerald-50' },
          { icon: '✏️', num: draftPosts,     label: 'Drafts',      color: 'from-amber-50 to-yellow-50' },
          { icon: '🏷️', num: tagCount,       label: 'Unique Tags', color: 'from-purple-50 to-pink-50' },
        ].map(s => (
          <div key={s.label} className={`glass-card rounded-2xl p-4 bg-gradient-to-br ${s.color} border border-pink-100/60 hover:shadow-petal transition-all hover:-translate-y-0.5`}>
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="font-serif text-2xl text-[#4a2d35]">
              {loading ? <span className="inline-block w-6 h-5 bg-pink-100 rounded animate-pulse" /> : s.num}
            </div>
            <div className="text-[11px] text-[#9e7580] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions (flat bar) ──────────────────────── */}
      <div className="glass-card rounded-2xl px-5 py-3 mb-5 flex items-center gap-3 flex-wrap">
        <span className="text-[10px] tracking-[0.14em] uppercase text-[#c4a0ac] mr-1 hidden sm:block">Quick Actions</span>
        <Link href="/dashboard/posts/new">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all hover:scale-[1.02] font-medium">
            <Plus size={13} /> New Post
          </button>
        </Link>
        <Link href="/dashboard/posts">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-pink-100 text-[#9e7580] text-[12px] hover:bg-pink-50 hover:text-[#4a2d35] transition-all">
            <FileText size={13} /> Manage Posts
          </button>
        </Link>
        <Link href="/blog">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-pink-100 text-[#9e7580] text-[12px] hover:bg-pink-50 hover:text-[#4a2d35] transition-all">
            <BookOpen size={13} /> View Blog
          </button>
        </Link>
      </div>

      {/* ── All Posts ────────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[16px] text-[#4a2d35]">All Posts</h2>
          <Link href="/dashboard/posts/new">
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all hover:scale-105">
              <Plus size={12} /> New Post
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-pink-50/60 rounded-2xl animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✍️</div>
            <p className="font-serif text-[#4a2d35] mb-1">No posts yet</p>
            <p className="text-[#9e7580] text-[13px] mb-5">Create your first blog post to get started.</p>
            <Link href="/dashboard/posts/new">
              <button className="px-5 py-2 rounded-full bg-pink-200 text-[#4a2d35] text-[13px] hover:bg-pink-300 transition-all">
                Write first post →
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <div key={post.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-pink-50/60 transition-colors group">
                <span className={`w-2 h-2 rounded-full shrink-0 ${post.status === 'published' ? 'bg-green-400' : 'bg-amber-300'}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-[#4a2d35] font-medium truncate">{post.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#c4a0ac] mt-0.5">
                    {post.published_at ? formatLongDate(post.published_at) : `Created ${formatDate(post.created_at)}`}
                    {post.tags?.length > 0 && ` · ${post.tags.slice(0, 2).join(', ')}`}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => toggleStatus(post)}
                    title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    className="p-1.5 rounded-lg hover:bg-pink-100 text-[#9e7580] hover:text-[#4a2d35] transition-colors"
                  >
                    {post.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                    <button className="p-1.5 rounded-lg hover:bg-pink-100 text-[#9e7580] hover:text-[#4a2d35] transition-colors">
                      <Edit3 size={14} />
                    </button>
                  </Link>
                  <button
                    onClick={() => deletePost(post.slug, post.title)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#9e7580] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  {post.status === 'published' && (
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <button className="p-1.5 rounded-lg hover:bg-pink-100 text-[#9e7580] hover:text-pink-400 transition-colors">
                        <BookOpen size={14} />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
