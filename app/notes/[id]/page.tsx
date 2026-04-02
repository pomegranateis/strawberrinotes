import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import NoteEditorClient from './NoteEditorClient'

export default async function NoteEditorPage({ params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const isNew = params.id === 'new'

  return (
    <AppLayout>
      <NoteEditorClient userId={userId} noteId={isNew ? null : params.id} />
    </AppLayout>
  )
}
