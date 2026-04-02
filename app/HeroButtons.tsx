'use client'
import Link from 'next/link'
import { SignUpButton, useAuth } from '@clerk/nextjs'

export default function HeroButtons() {
  const { isSignedIn } = useAuth()

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {!isSignedIn && (
        <SignUpButton mode="modal">
          <button className="px-8 py-3 rounded-full bg-pink-200 text-[#4a2d35] text-sm hover:bg-pink-300 transition-all hover:scale-105 shadow-petal">
            Start reading ✦
          </button>
        </SignUpButton>
      )}
      {isSignedIn && (
        <Link href="/dashboard" className="px-8 py-3 rounded-full bg-pink-200 text-[#4a2d35] text-sm hover:bg-pink-300 transition-all hover:scale-105 shadow-petal">
          Go to Dashboard ✦
        </Link>
      )}
      <Link href="/blog" className="px-8 py-3 rounded-full border border-pink-200 text-[#9e7580] text-sm hover:bg-pink-50 transition-colors">
        Browse the blog →
      </Link>
    </div>
  )
}
