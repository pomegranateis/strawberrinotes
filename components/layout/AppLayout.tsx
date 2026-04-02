import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import PublicNav from '@/components/layout/PublicNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      <PublicNav />
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
