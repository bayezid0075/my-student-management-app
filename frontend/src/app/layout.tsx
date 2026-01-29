import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Student Management System',
  description: 'A retro-styled student management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
