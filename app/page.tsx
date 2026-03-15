import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { ServicesPreview } from '@/components/home/ServicesPreview'
import { WhyUs } from '@/components/home/WhyUs'
import { StatsSection } from '@/components/home/StatsSection'
import { Testimonials } from '@/components/home/Testimonials'
import { CTABanner } from '@/components/home/CTABanner'

export const metadata: Metadata = {
  title: '3C Core | Property Management — Connected · Consistent · Confident',
  description: 'Expert property management, lettings consultancy, and investment advisory services. Protecting your asset, maximising your returns.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <WhyUs />
      <StatsSection />
      <Testimonials />
      <CTABanner />
    </>
  )
}
