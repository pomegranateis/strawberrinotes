import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import DashboardAdmin from './DashboardAdmin'
import DashboardUser from './DashboardUser'
import { isAdminEmail } from '@/lib/admin'

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const emails = user?.emailAddresses.map(e => e.emailAddress) ?? []
  const isAdmin = isAdminEmail(emails)

  return (
    <AppLayout>
      {isAdmin ? <DashboardAdmin /> : <DashboardUser />}
    </AppLayout>
  )
}
