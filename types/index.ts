export interface Service {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  icon: string
  benefits: string[]
  process: { step: number; title: string; description: string }[]
  relatedCaseStudies?: string[]
}

export interface CaseStudy {
  id: string
  slug: string
  title: string
  industry: string
  serviceType: string
  outcome: string
  challenge: string
  approach: string
  results: string[]
  clientQuote?: string
  clientName?: string
  clientCompany?: string
}

export interface TeamMember {
  id: string
  name: string
  title: string
  bio: string
  linkedIn?: string
  image?: string
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  company: string
  role: string
}

export interface TimelineEvent {
  year: string
  title: string
  description: string
}

export interface ContactFormData {
  name: string
  company: string
  email: string
  phone: string
  service: string
  message: string
}
