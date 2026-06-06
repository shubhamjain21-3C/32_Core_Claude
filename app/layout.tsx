import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import '@/styles/globals.css'
import { CookieConsentBanner } from '@/components/ui/CookieConsentBanner'
import { Providers } from '@/components/Providers'
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
    default: '3C Core | Property Services — Connected · Consistent · Confident',
    template: '%s | 3C Core',
  },
  description: 'Professional property services — inventory, inspections, dispute resolution, maintenance and deposit negotiation. UK-based, GDPR compliant.',
  metadataBase: new URL('https://3ccore.com'),
  openGraph: {
    title: '3C Core — Property Services',
    description: 'One Skyline. Infinite Needs. Property Services You Can Finally Trust.',
    url: 'https://3ccore.com',
    siteName: '3C Core',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3C Core — Property Services',
    description: 'One Skyline. Infinite Needs. Property Services You Can Finally Trust.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <Providers>
          {children}
          <CookieConsentBanner />
          <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#2C1F14',
              color: '#FFF8EE',
              border: '1px solid rgba(212,134,10,0.4)',
            },
          }}
        />
        </Providers>
      </body>
    </html>
  )
}
