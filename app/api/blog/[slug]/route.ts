import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin'

interface Params { params: { slug: string } }

// GET /api/blog/[slug] — public if published, admin sees drafts too
export async function GET(req: Request, { params }: Params) {
  const { userId } = auth()
  const supabase = createServiceClient()

  let admin = false
  if (userId) {
    const user = await currentUser()
    admin = isAdminEmail(user?.emailAddresses.map(e => e.emailAddress) ?? [])
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (data.status !== 'published' && !admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/blog/[slug] — admin only: update post
export async function PATCH(req: Request, { params }: Params) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (!isAdminEmail(user?.emailAddresses.map(e => e.emailAddress) ?? [])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const supabase = createServiceClient()

  // If publishing for the first time, set published_at
  const updates: Record<string, unknown> = { ...body }
  if (body.status === 'published') {
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('published_at')
      .eq('slug', params.slug)
      .single()
    if (!existing?.published_at) {
      updates.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('slug', params.slug)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Bust caches so unpublished posts disappear immediately
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${params.slug}`)

  return NextResponse.json(data)
}

// DELETE /api/blog/[slug] — admin only
export async function DELETE(req: Request, { params }: Params) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (!isAdminEmail(user?.emailAddresses.map(e => e.emailAddress) ?? [])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('blog_posts').delete().eq('slug', params.slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
