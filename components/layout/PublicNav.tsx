'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton, useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useState } from 'react'
import { Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const publicTabs = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
]

export default function PublicNav() {
  const pathname        = usePathname()
  const { isSignedIn }  = useAuth()
  const { user }        = useUser()
  const { signOut, openUserProfile } = useClerk()
  const [open, setOpen] = useState(false)

  const tabs = isSignedIn
    ? [...publicTabs, { label: 'Dashboard', href: '/dashboard' }]
    : publicTabs

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🍓</span>
          <span className="font-serif text-[15px] text-[#4a2d35] tracking-tight hidden sm:block">
            Strawberries&amp;Notes
          </span>
        </Link>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map(tab => {
            const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
            return (
              <Link key={tab.href} href={tab.href}>
                <span className={cn(
                  'px-4 py-1.5 rounded-full text-[13px] transition-all',
                  active
                    ? 'bg-pink-100 text-[#4a2d35] font-medium'
                    : 'text-[#9e7580] hover:text-[#4a2d35] hover:bg-pink-50',
                )}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-2 shrink-0">
          {isSignedIn ? (
            <div className="relative">
              <button
                onClick={() => setOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-pink-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center text-white text-[11px] font-medium shrink-0">
                  {user?.firstName?.[0] ?? '?'}
                </div>
                <span className="text-[13px] text-[#4a2d35] hidden sm:block">
                  {user?.firstName ?? 'You'}
                </span>
                <span className="text-pink-300 text-[10px]">▾</span>
              </button>

              {open && (
                <div className="absolute right-0 top-11 bg-white border border-pink-100 rounded-2xl shadow-lg p-1.5 min-w-[160px] z-50 animate-fade-in">
                  <button
                    onClick={() => { openUserProfile(); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-pink-50 text-[13px] text-[#4a2d35] transition-colors"
                  >
                    <Settings size={13} className="text-[#9e7580]" /> Manage account
                  </button>
                  <button
                    onClick={() => { signOut(); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-[13px] text-red-400 transition-colors mt-0.5"
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-1.5 rounded-full text-[13px] text-[#9e7580] hover:bg-pink-50 transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-1.5 rounded-full text-[13px] bg-pink-200 text-[#4a2d35] hover:bg-pink-300 transition-all hover:scale-105 border border-pink-200">
                  Sign up ✦
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
