/**
 * In-memory data store — DEMO / PROTOTYPE ONLY
 * ─────────────────────────────────────────────
 * Suitable for local development and demonstrations.
 * On Vercel serverless, data resets between cold starts.
 *
 * To persist data in production, replace this module with:
 *   - Prisma + PostgreSQL / Supabase
 *   - MongoDB / Mongoose
 *   - Vercel KV (Redis)
 *   - PlanetScale MySQL
 */

import { createHash } from 'crypto'
import type { PortalUser, Property, CustomerService } from '@/types'

export const hash = (pw: string) =>
  createHash('sha256').update(pw + 'salt_3ccore').digest('hex')

// ── Users ──────────────────────────────────────────────────────────────────────

export const users = new Map<string, PortalUser>([
  ['demo-customer-1', {
    id: 'demo-customer-1',
    name: 'James Whitfield',
    email: 'james@demo.com',
    passwordHash: hash('demo1234'),
    role: 'customer',
    company: 'Whitfield Properties',
    phone: '+44 7700 000001',
    createdAt: '2024-01-15',
  }],
  ['demo-customer-2', {
    id: 'demo-customer-2',
    name: 'Priya Sharma',
    email: 'priya@demo.com',
    passwordHash: hash('demo1234'),
    role: 'customer',
    company: 'PS Estates Ltd',
    phone: '+44 7700 000002',
    createdAt: '2024-03-01',
  }],
])

export const findUserByEmail = (email: string) =>
  Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null

export const createUser = (data: Omit<PortalUser, 'id' | 'createdAt'>): PortalUser => {
  const id = `user-${Date.now()}`
  const user: PortalUser = { ...data, id, createdAt: new Date().toISOString().split('T')[0] }
  users.set(id, user)
  return user
}

// ── Properties ────────────────────────────────────────────────────────────────

export const properties = new Map<string, Property>([
  ['prop-1', {
    id: 'prop-1',
    customerId: 'demo-customer-1',
    address: '14 Maple Avenue',
    postcode: 'SW1A 1AA',
    type: 'Residential',
    bedrooms: 2,
    monthlyRent: 1850,
    status: 'Occupied',
    serviceIds: ['property-management', 'compliance-legal'],
    createdAt: '2024-01-20',
  }],
  ['prop-2', {
    id: 'prop-2',
    customerId: 'demo-customer-1',
    address: '7 Oak Street, Flat 3',
    postcode: 'E1 6RF',
    type: 'Residential',
    bedrooms: 1,
    monthlyRent: 1400,
    status: 'Occupied',
    serviceIds: ['property-management'],
    createdAt: '2024-02-10',
  }],
  ['prop-3', {
    id: 'prop-3',
    customerId: 'demo-customer-1',
    address: '22 Victoria Road',
    postcode: 'N1 5TQ',
    type: 'HMO',
    bedrooms: 5,
    monthlyRent: 3600,
    status: 'Occupied',
    serviceIds: ['property-management', 'tenant-relations', 'maintenance-facilities', 'compliance-legal'],
    createdAt: '2024-03-05',
  }],
  ['prop-4', {
    id: 'prop-4',
    customerId: 'demo-customer-2',
    address: '88 Park Lane',
    postcode: 'W1K 7TN',
    type: 'Commercial',
    bedrooms: 0,
    monthlyRent: 5200,
    status: 'Occupied',
    serviceIds: ['property-management', 'compliance-legal'],
    createdAt: '2024-03-10',
  }],
])

export const getPropertiesByCustomer = (customerId: string) =>
  Array.from(properties.values()).filter(p => p.customerId === customerId)

export const createProperty = (data: Omit<Property, 'id' | 'createdAt'>): Property => {
  const id = `prop-${Date.now()}`
  const property: Property = { ...data, id, createdAt: new Date().toISOString().split('T')[0] }
  properties.set(id, property)
  return property
}

export const deleteProperty = (id: string) => properties.delete(id)

// ── Customer Services ─────────────────────────────────────────────────────────

export const customerServices = new Map<string, CustomerService>([
  ['svc-1', {
    id: 'svc-1',
    customerId: 'demo-customer-1',
    propertyId: 'prop-1',
    serviceName: 'Property Management',
    startDate: '2024-01-20',
    status: 'Active',
    benefits: ['Void period reduced from 6 weeks to under 1 week', 'Rent collected on time every month', 'Gas & EPC certificates renewed on schedule'],
  }],
  ['svc-2', {
    id: 'svc-2',
    customerId: 'demo-customer-1',
    propertyId: 'prop-3',
    serviceName: 'Compliance & Legal',
    startDate: '2024-03-05',
    status: 'Active',
    benefits: ['HMO licence secured within 3 weeks', 'All safety certificates up to date', 'Zero compliance breaches since onboarding'],
  }],
  ['svc-3', {
    id: 'svc-3',
    customerId: 'demo-customer-1',
    propertyId: 'prop-3',
    serviceName: 'Tenant Relations',
    startDate: '2024-03-05',
    status: 'Active',
    benefits: ['Tenant satisfaction score: 94%', 'All 5 rooms re-let within 2 weeks of vacancy', 'No formal disputes raised'],
  }],
  ['svc-4', {
    id: 'svc-4',
    customerId: 'demo-customer-2',
    propertyId: 'prop-4',
    serviceName: 'Property Management',
    startDate: '2024-03-10',
    status: 'Active',
    benefits: ['Lease renewal secured at 12% uplift', 'Service charge reconciliation completed on time', 'Emergency repairs resolved within 4 hours average'],
  }],
])

export const getServicesByCustomer = (customerId: string) =>
  Array.from(customerServices.values()).filter(s => s.customerId === customerId)

export const getAllCustomers = () =>
  Array.from(users.values()).filter(u => u.role === 'customer')
