import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user   = await currentUser()
  const emails = user?.emailAddresses.map(e => e.emailAddress) ?? []
  if (!isAdminEmail(emails)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, GIF, and WebP images are allowed' }, { status: 400 })
  }
  const extMap: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extMap[file.type]}`

  const supabase   = createServiceClient()
  const arrayBuffer = await file.arrayBuffer()
  const { error }  = await supabase.storage
    .from('blog-images')
    .upload(filename, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl })
}
