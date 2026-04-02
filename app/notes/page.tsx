import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import NotesClient from './NotesClient'

export default async function NotesPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <AppLayout>
      <NotesClient userId={userId} />
    </AppLayout>
  )
}
