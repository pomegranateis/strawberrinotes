import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import TimetableClient from './TimetableClient'

export default async function TimetablePage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <AppLayout>
      <TimetableClient userId={userId} />
    </AppLayout>
  )
}
