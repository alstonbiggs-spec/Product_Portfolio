import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Geist } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: 'Alston Biggs — Selected Work',
  description: 'A scroll-driven portfolio of selected projects by Alston Biggs.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#101a30',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${geist.variable} bg-background`}>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
