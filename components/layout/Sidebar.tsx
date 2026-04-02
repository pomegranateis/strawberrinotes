'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/blog',      icon: '✍️', label: 'Blog' },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const { user }  = useUser()
  const { signOut, openUserProfile } = useClerk()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <aside className="group/sidebar relative flex flex-col w-14 hover:w-56 transition-all duration-300 ease-in-out bg-gradient-to-b from-pink-50 to-[#fdf0f3] border-r border-pink-100 overflow-hidden shrink-0 z-40">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-[18px] border-b border-pink-100 min-h-[60px]">
        <span className="text-xl shrink-0">🍓</span>
        <span className="font-serif text-[13px] text-[#4a2d35] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Strawberries&Notes
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-hidden">

        {/* Main */}
        <div className="mb-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex items-center gap-3 px-4 py-[9px] relative cursor-pointer transition-colors',
                pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                  ? 'bg-pink-100'
                  : 'hover:bg-pink-50'
              )}>
                {(pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))) && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-pink-400 rounded-r" />
                )}
                <span className="text-base shrink-0 w-6 text-center">{item.icon}</span>
                <span className="text-[13px] text-[#4a2d35] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </nav>

      {/* User footer */}
      <div className="border-t border-pink-100 py-2 relative">
        <button
          onClick={() => setProfileOpen(p => !p)}
          className="flex items-center gap-3 px-4 py-2 w-full hover:bg-pink-50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center text-[11px] text-white font-medium shrink-0">
            {user?.firstName?.[0] ?? 'P'}{user?.lastName?.[0] ?? ''}
          </div>
          <span className="text-[12px] text-[#4a2d35] opacity-0 group-hover/sidebar:opacity-100 transition-opacity whitespace-nowrap truncate">
            {user?.firstName ?? 'You'} ✦
          </span>
        </button>

        {/* Profile dropdown */}
        {profileOpen && (
          <div className="absolute bottom-12 left-4 right-4 bg-white border border-pink-100 rounded-2xl shadow-petal p-2 z-50 animate-fade-in">
            <button
              onClick={() => { openUserProfile(); setProfileOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-pink-50 text-[13px] text-[#4a2d35] transition-colors"
            >
              <span>👤</span> Edit profile
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-red-50 text-[13px] text-red-400 transition-colors mt-1"
            >
              <span>🚪</span> Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
