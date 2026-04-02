import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse FormData
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 3. Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' }, { status: 400 })
    }

    // 4. Validate file size (5 MB max)
    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 })
    }

    // 5. Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const fileName = `${userId}/${timestamp}-${randomStr}.${ext}`

    // 6. Upload to Supabase Storage
    const supabase = createServiceClient()
    const fileBuffer = await file.arrayBuffer()

    const { data, error } = await supabase.storage
      .from('note-images')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
    }

    // 7. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('note-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl }, { status: 201 })

  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
