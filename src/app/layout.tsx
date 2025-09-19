import type { Metadata, Viewport } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import '../styles/mobile-optimizations.css'
import { AdminProvider } from '@/contexts/AdminContext'
import UniversalLayout from '@/components/UniversalLayout'

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'thehackai - Battle-tested AI workflows that actually work',
  description: 'Access curated AI tools and guides. Pro £7/month, Ultra £19/month. Proven GPTs, PDF guides, and monthly additions.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon-64x64.png',
        color: '#8b5cf6'
      }
    ]
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // Essential for safe-area-inset-* to work
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className={`${roboto.className} font-body`}>
        <AdminProvider>
          <UniversalLayout>
            {children}
          </UniversalLayout>
        </AdminProvider>
      </body>
    </html>
  )
}