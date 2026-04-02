import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import BlogEditor from '@/components/editor/BlogEditor'
import { isAdminEmail } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase'
import type { BlogPost } from '@/types'

interface Props { params: { id: string } }

export default async function EditPostPage({ params }: Props) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const emails = user?.emailAddresses.map(e => e.emailAddress) ?? []
  if (!isAdminEmail(emails)) redirect('/dashboard')

  const supabase = createServiceClient()
  const { data } = await supabase.from('blog_posts').select('*').eq('id', params.id).single()
  if (!data) notFound()

  return (
    <AppLayout>
      <BlogEditor post={data as BlogPost} />
    </AppLayout>
  )
}
