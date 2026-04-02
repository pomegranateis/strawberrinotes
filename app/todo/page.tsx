import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import TodoClient from './TodoClient'

export default async function TodoPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <AppLayout>
      <TodoClient userId={userId} />
    </AppLayout>
  )
}
