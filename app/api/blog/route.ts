import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAIL, isAdminEmail } from '@/lib/admin'
import { slugify } from '@/lib/utils'

// GET /api/blog — public: published posts; admin: all posts
export async function GET(req: Request) {
  const { userId } = auth()
  const supabase = createServiceClient()

  // Check if caller is admin
  let admin = false
  if (userId) {
    const user = await currentUser()
    admin = isAdminEmail(user?.emailAddresses.map(e => e.emailAddress) ?? [])
  }

  let query = supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, tags, status, cover_image, published_at, created_at, updated_at, author_id')
    .order('created_at', { ascending: false })

  if (!admin) {
    query = query.eq('status', 'published')
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/blog — admin only: create post
export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const emails = user?.emailAddresses.map(e => e.emailAddress) ?? []
  if (!isAdminEmail(emails)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, content, excerpt, tags, status, cover_image } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Generate unique slug
  let baseSlug = slugify(title)
  let slug = baseSlug
  let suffix = 0
  while (true) {
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()
    if (!existing) break
    suffix++
    slug = `${baseSlug}-${suffix}`
  }

  const published_at = status === 'published' ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      author_id: userId,
      title: title.trim(),
      slug,
      content: content ?? '',
      excerpt: excerpt?.trim() || null,
      tags: tags ?? [],
      status: status ?? 'draft',
      cover_image: cover_image?.trim() || null,
      published_at,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/blog')

  return NextResponse.json(data, { status: 201 })
}
