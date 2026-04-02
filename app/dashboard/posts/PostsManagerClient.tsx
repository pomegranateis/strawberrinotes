'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate, formatLongDate } from '@/lib/utils'
import type { BlogPost } from '@/types'
import { Plus, Edit3, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PostsManagerClient() {
  const [posts, setPosts]     = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

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
      toast.error('Failed to delete')
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
      toast.success(newStatus === 'published' ? 'Published ✦' : 'Moved to drafts')
    } else {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 md:p-8 animate-fade-in bg-gradient-to-br from-pink-50/50 via-[#fdf8f5] to-pink-50/30">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-[24px] text-[#4a2d35]">Manage Posts</h1>
            <p className="text-[12px] text-[#9e7580] mt-0.5">{posts.length} total · {posts.filter(p => p.status === 'published').length} published · {posts.filter(p => p.status === 'draft').length} drafts</p>
          </div>
          <Link href="/dashboard/posts/new">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-200 text-[#4a2d35] text-[13px] hover:bg-pink-300 transition-all hover:scale-105 font-medium shadow-petal">
              <Plus size={14} /> New Post
            </button>
          </Link>
        </div>

        {/* Posts */}
        <div className="glass-card rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-pink-50/60 rounded-2xl animate-pulse" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-serif text-[#4a2d35] mb-2">No posts yet</p>
              <Link href="/dashboard/posts/new">
                <button className="mt-2 px-5 py-2 rounded-full bg-pink-200 text-[#4a2d35] text-[13px] hover:bg-pink-300 transition-all">
                  Create your first post →
                </button>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-pink-100">
                  <th className="text-left px-5 py-3 text-[11px] tracking-[0.1em] uppercase text-[#c4a0ac] font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-[11px] tracking-[0.1em] uppercase text-[#c4a0ac] font-medium hidden sm:table-cell">Tags</th>
                  <th className="text-left px-4 py-3 text-[11px] tracking-[0.1em] uppercase text-[#c4a0ac] font-medium hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-[11px] tracking-[0.1em] uppercase text-[#c4a0ac] font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b border-pink-50 last:border-0 hover:bg-pink-50/40 transition-colors group">
                    <td className="px-5 py-3">
                      <span className="text-[13px] text-[#4a2d35] font-medium">{post.title}</span>
                      {post.excerpt && (
                        <p className="text-[11px] text-[#c4a0ac] mt-0.5 line-clamp-1">{post.excerpt}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-400 text-[10px] border border-pink-100">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[11px] text-[#c4a0ac]">
                        {post.published_at ? formatLongDate(post.published_at) : formatDate(post.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${post.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleStatus(post)} title={post.status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 rounded-lg hover:bg-pink-100 text-[#9e7580] hover:text-[#4a2d35] transition-colors">
                          {post.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link href={`/dashboard/posts/${post.id}/edit`}>
                          <button className="p-1.5 rounded-lg hover:bg-pink-100 text-[#9e7580] hover:text-[#4a2d35] transition-colors">
                            <Edit3 size={14} />
                          </button>
                        </Link>
                        {post.status === 'published' && (
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <button className="p-1.5 rounded-lg hover:bg-pink-100 text-[#9e7580] hover:text-pink-400 transition-colors">
                              <BookOpen size={14} />
                            </button>
                          </Link>
                        )}
                        <button onClick={() => deletePost(post.slug, post.title)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9e7580] hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
