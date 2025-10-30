import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlowAgent Admin - Content Management',
  description: 'Manage your chatbot\'s knowledge base',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-100 to-slate-300 min-h-screen p-5">
        {children}
      </body>
    </html>
  )
}
