import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import PostsManagerClient from './PostsManagerClient'
import { isAdminEmail } from '@/lib/admin'

export default async function PostsPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const emails = user?.emailAddresses.map(e => e.emailAddress) ?? []
  if (!isAdminEmail(emails)) redirect('/dashboard')

  return (
    <AppLayout>
      <PostsManagerClient />
    </AppLayout>
  )
}
