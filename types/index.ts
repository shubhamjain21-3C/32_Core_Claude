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

// ── Portal / Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'admin'

export interface PortalUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  company?: string
  phone?: string
  createdAt: string
}

export type PropertyType = 'Residential' | 'HMO' | 'Commercial' | 'Student' | 'Holiday Let'
export type PropertyStatus = 'Occupied' | 'Vacant' | 'Under Management' | 'For Letting'

export interface Property {
  id: string
  customerId: string
  address: string
  postcode: string
  type: PropertyType
  bedrooms: number
  monthlyRent: number
  status: PropertyStatus
  serviceIds: string[]   // which 3C Core services are active on this property
  createdAt: string
}

export interface CustomerService {
  id: string
  customerId: string
  propertyId: string
  serviceName: string
  startDate: string
  status: 'Active' | 'Paused' | 'Completed'
  benefits: string[]    // measurable outcomes achieved
}
