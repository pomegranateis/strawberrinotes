import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import NoteEditorClient from '../[id]/NoteEditorClient'

export default async function NewNotePage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <AppLayout>
      <NoteEditorClient userId={userId} noteId={null} />
    </AppLayout>
  )
}
