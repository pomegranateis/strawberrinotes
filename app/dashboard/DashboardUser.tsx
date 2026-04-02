'use client'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { BookOpen, User } from 'lucide-react'

export default function DashboardUser() {
  const { user } = useUser()
  const firstName = user?.firstName ?? 'there'

  return (
    <div className="flex-1 overflow-auto p-6 md:p-8 animate-fade-in bg-gradient-to-br from-pink-50/50 via-cream to-rose-lace/30">

      {/* Welcome */}
      <div className="glass-card rounded-3xl p-6 mb-6 glow-pink relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-gradient-to-br from-pink-200/40 to-rose-300/20 blur-2xl pointer-events-none" />
        <div className="relative">
          <h1 className="font-serif text-[26px] text-[#4a2d35] mb-1">
            Welcome, <em className="text-pink-400 not-italic">{firstName}</em> 🌸
          </h1>
          <p className="text-[13px] text-[#9e7580]">
            You're signed in as a member.
          </p>
        </div>
      </div>

      {/* Member card */}
      <div className="max-w-lg mx-auto">
        <div className="glass-card rounded-3xl p-8 text-center glow-pink">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-petal">
            <User size={32} />
          </div>

          <div className="font-serif text-xl text-[#4a2d35] mb-1">
            {user?.fullName ?? firstName}
          </div>
          <div className="text-[12px] text-[#9e7580] mb-4">
            {user?.primaryEmailAddress?.emailAddress}
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[#9e7580] text-[12px] border border-pink-100 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
            Member
          </span>

          <div className="bg-pink-50/70 rounded-2xl p-5 border border-pink-100 mb-6 text-left">
            <p className="text-[13px] text-[#4a2d35] font-medium mb-1">Member access</p>
            <p className="text-[12px] text-[#9e7580] leading-relaxed">
              You can read all published blog posts and use the personal workspace features — notes, to-do lists, and timetable.
              Blog post creation and management is reserved for admins.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/blog">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-pink-200 text-[#4a2d35] text-[13px] hover:bg-pink-300 transition-all hover:scale-[1.02] font-medium">
                <BookOpen size={14} /> Read the Blog
              </button>
            </Link>
            <Link href="/notes">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-pink-100 text-[#9e7580] text-[13px] hover:bg-pink-50 hover:text-[#4a2d35] transition-all">
                📝 My Notes
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
