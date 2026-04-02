import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream to-rose-lace flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-3xl mb-3">🍓</div>
        <h1 className="font-serif text-2xl text-[#4a2d35]">Start your soft workspace</h1>
        <p className="text-[13px] text-[#9e7580] mt-1">Create your Strawberries&Notes account ✦</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            card: 'rounded-3xl border border-pink-100 shadow-petal',
            headerTitle: 'font-serif text-[#4a2d35]',
            formButtonPrimary: 'bg-pink-300 hover:bg-pink-400 text-[#4a2d35] rounded-full',
            footerActionLink: 'text-pink-400 hover:text-pink-500',
          }
        }}
      />
    </div>
  )
}
