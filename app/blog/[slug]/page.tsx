import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { formatLongDate } from '@/lib/utils'
import PublicNav from '@/components/layout/PublicNav'
import type { BlogPost } from '@/types'

export const revalidate = 60

interface Props { params: { slug: string } }

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data as BlogPost | null
}

export async function generateMetadata({ params }: Props) {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: `${post.title} — Strawberries&Notes`,
    description: post.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream to-rose-lace">
      <PublicNav />

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-[13px] text-[#9e7580] hover:text-pink-500 transition-colors mb-10 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Blog
        </Link>

        {/* Cover image */}
        {post.cover_image && (
          <div className="rounded-3xl overflow-hidden mb-10 shadow-petal">
            <img src={post.cover_image} alt={post.title} className="w-full max-h-72 object-cover" />
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-500 text-[11px] border border-pink-100">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-4xl text-[#4a2d35] leading-tight mb-3">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-pink-100">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center text-white text-xs font-medium shrink-0">
            🍓
          </span>
          <div>
            <p className="text-[12px] text-[#4a2d35] font-medium">Strawberries&amp;Notes</p>
            <p className="text-[11px] text-[#c4a0ac]">
              {post.published_at ? formatLongDate(post.published_at) : formatLongDate(post.created_at)}
            </p>
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-[#9e7580] text-base leading-relaxed mb-8 italic border-l-2 border-pink-200 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="blog-content prose-strawberry"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-pink-100 text-center">
          <Link href="/blog">
            <button className="px-6 py-2.5 rounded-full bg-pink-100 text-[#4a2d35] text-sm hover:bg-pink-200 transition-colors">
              ← More posts
            </button>
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-[#c4a0ac] border-t border-pink-100 mt-8">
        🍓 Strawberries&amp;Notes — made with softness ✦
      </footer>
    </div>
  )
}
