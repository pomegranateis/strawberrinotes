import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Strawberries & Notes',
  description: 'Your soft, sweet workspace for notes, todos, and timetables.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#fff5f7',
                border: '1px solid #ffc2d1',
                color: '#4a2d35',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#f07fa0', secondary: '#fff' } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
