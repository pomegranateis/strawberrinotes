import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { formatLongDate } from '@/lib/utils'
import PublicNav from '@/components/layout/PublicNav'
import type { BlogPost } from '@/types'

export const revalidate = 60

async function getPosts(): Promise<BlogPost[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, tags, cover_image, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  return (data as BlogPost[]) ?? []
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream to-rose-lace">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-pink-400 mb-3">Stories &amp; thoughts</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#4a2d35] mb-4">The Blog 🍓</h1>
          <p className="text-[#9e7580] text-sm max-w-md mx-auto leading-relaxed">
            Musings, guides, and gentle notes — freely available for all to read.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌱</div>
            <p className="font-serif text-xl text-[#4a2d35] mb-2">No posts yet</p>
            <p className="text-[#9e7580] text-sm">Check back soon — something sweet is growing here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className={`group glass-card rounded-3xl overflow-hidden hover:shadow-glow-pink transition-all duration-300 hover:-translate-y-1 ${i === 0 ? 'border-pink-200/80' : ''}`}>
                  {post.cover_image && (
                    <div className="h-52 overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-7">
                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-500 text-[11px] border border-pink-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-serif text-2xl text-[#4a2d35] mb-2 group-hover:text-pink-500 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[#9e7580] text-sm leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#c4a0ac]">
                        {post.published_at ? formatLongDate(post.published_at) : formatLongDate(post.created_at)}
                      </span>
                      <span className="text-[12px] text-pink-400 group-hover:translate-x-1 transition-transform">
                        Read more →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-[#c4a0ac] border-t border-pink-100 mt-16">
        🍓 Strawberries&amp;Notes — made with softness ✦
      </footer>
    </div>
  )
}
