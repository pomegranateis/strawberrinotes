import Link from 'next/link'
import PublicNav from '@/components/layout/PublicNav'
import HeroButtons from './HeroButtons'
import { createServiceClient } from '@/lib/supabase'
import { formatLongDate } from '@/lib/utils'

export const revalidate = 60

export default async function LandingPage() {
  const supabase = createServiceClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, tags, cover_image, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  const recentPosts = posts ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-[#fdf8f5] to-pink-50">
      <PublicNav />

      {/* Hero */}
      <section className="text-center px-6 py-24">
        <p className="text-xs tracking-[0.2em] uppercase text-pink-400 mb-4">A soft corner of the internet</p>
        <h1 className="font-serif text-5xl md:text-6xl text-[#4a2d35] leading-tight mb-6">
          Words, stories,<br />
          and <em className="text-pink-400 not-italic">strawberry thoughts</em>
        </h1>
        <p className="text-[#9e7580] text-base max-w-md mx-auto mb-10 leading-relaxed">
          A personal blog wrapped in the softest strawberry aesthetic — open to everyone, no login needed.
        </p>
        <HeroButtons />
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl text-[#4a2d35]">Latest Posts</h2>
            <Link href="/blog" className="text-[13px] text-pink-400 hover:text-pink-600 transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {recentPosts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="glass-card rounded-3xl overflow-hidden hover:shadow-glow-pink transition-all duration-300 hover:-translate-y-1 group h-full flex flex-col">
                  {post.cover_image && (
                    <div className="h-40 overflow-hidden shrink-0">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-400 text-[10px] border border-pink-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="font-serif text-[16px] text-[#4a2d35] mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-[12px] text-[#9e7580] line-clamp-2 mb-3 flex-1 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <p className="text-[11px] text-[#c4a0ac] mt-auto">
                      {formatLongDate(post.published_at ?? post.created_at)}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state — only show when no posts yet */}
      {recentPosts.length === 0 && (
        <section className="text-center py-16 px-6">
          <div className="text-4xl mb-4">🌱</div>
          <p className="font-serif text-xl text-[#4a2d35] mb-2">Something sweet is growing here</p>
          <p className="text-[#9e7580] text-sm">Check back soon for the first post.</p>
        </section>
      )}

      <footer className="text-center py-8 text-xs text-[#c4a0ac] border-t border-pink-100">
        🍓 Strawberries&amp;Notes — made with softness ✦
      </footer>
    </div>
  )
}
