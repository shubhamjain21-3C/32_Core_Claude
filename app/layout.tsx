import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: '3C Core | Property Management — Connected · Consistent · Confident',
    template: '%s | 3C Core',
  },
  description: 'Professional property management and lettings consultancy built on trust, precision, and lasting results.',
  metadataBase: new URL('https://3ccore.com'),
  openGraph: {
    title: '3C Core — Property Management',
    description: 'Professional property management built on trust, precision, and lasting results.',
    url: 'https://3ccore.com',
    siteName: '3C Core',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3C Core — Property Management',
    description: 'Professional property management built on trust, precision, and lasting results.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="bg-[#050d1a] text-[#c8dff0] font-body antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0d1f3c',
              color: '#c8dff0',
              border: '1px solid #1e3a5f',
            },
          }}
        />
      </body>
    </html>
  )
}
