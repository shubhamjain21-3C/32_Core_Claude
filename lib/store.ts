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
  ['user-shubham', {
    id: 'user-shubham',
    name: 'Shubham Jain',
    email: 'shubham@3ccore.com',
    passwordHash: hash('Shubham@123'),
    role: 'customer',
    company: '3C Core Ltd',
    phone: '+44 7700 000001',
    createdAt: '2024-01-10',
  }],
  ['user-irfan', {
    id: 'user-irfan',
    name: 'Irfan Ahmed',
    email: 'irfan@3ccore.com',
    passwordHash: hash('Irfan@123'),
    role: 'customer',
    company: 'Ahmed Properties',
    phone: '+44 7700 000002',
    createdAt: '2024-02-05',
  }],
  ['user-adamya', {
    id: 'user-adamya',
    name: 'Adamya Singh',
    email: 'adamya@3ccore.com',
    passwordHash: hash('Adamya@123'),
    role: 'customer',
    company: 'Singh Estates',
    phone: '+44 7700 000003',
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
  // Shubham's properties
  ['prop-1', {
    id: 'prop-1',
    customerId: 'user-shubham',
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
    customerId: 'user-shubham',
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
    customerId: 'user-shubham',
    address: '22 Victoria Road',
    postcode: 'N1 5TQ',
    type: 'HMO',
    bedrooms: 5,
    monthlyRent: 3600,
    status: 'Occupied',
    serviceIds: ['property-management', 'tenant-relations', 'maintenance-facilities', 'compliance-legal'],
    createdAt: '2024-03-05',
  }],
  // Irfan's properties
  ['prop-4', {
    id: 'prop-4',
    customerId: 'user-irfan',
    address: '88 Park Lane',
    postcode: 'W1K 7TN',
    type: 'Commercial',
    bedrooms: 0,
    monthlyRent: 5200,
    status: 'Occupied',
    serviceIds: ['property-management', 'compliance-legal'],
    createdAt: '2024-02-15',
  }],
  ['prop-5', {
    id: 'prop-5',
    customerId: 'user-irfan',
    address: '45 Birchwood Close',
    postcode: 'M14 6GH',
    type: 'Residential',
    bedrooms: 3,
    monthlyRent: 1600,
    status: 'For Letting',
    serviceIds: ['lettings-consultancy', 'property-management'],
    createdAt: '2024-03-12',
  }],
  // Adamya's properties
  ['prop-6', {
    id: 'prop-6',
    customerId: 'user-adamya',
    address: '10 Regent Street',
    postcode: 'W1B 5TR',
    type: 'Student',
    bedrooms: 6,
    monthlyRent: 4200,
    status: 'Occupied',
    serviceIds: ['property-management', 'tenant-relations', 'compliance-legal'],
    createdAt: '2024-03-05',
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
  // Shubham's services
  ['svc-1', {
    id: 'svc-1',
    customerId: 'user-shubham',
    propertyId: 'prop-1',
    serviceName: 'Property Management',
    startDate: '2024-01-20',
    status: 'Active',
    benefits: ['Void period reduced from 6 weeks to under 1 week', 'Rent collected on time every month', 'Gas & EPC certificates renewed on schedule'],
  }],
  ['svc-2', {
    id: 'svc-2',
    customerId: 'user-shubham',
    propertyId: 'prop-3',
    serviceName: 'Compliance & Legal',
    startDate: '2024-03-05',
    status: 'Active',
    benefits: ['HMO licence secured within 3 weeks', 'All safety certificates up to date', 'Zero compliance breaches since onboarding'],
  }],
  ['svc-3', {
    id: 'svc-3',
    customerId: 'user-shubham',
    propertyId: 'prop-3',
    serviceName: 'Tenant Relations',
    startDate: '2024-03-05',
    status: 'Active',
    benefits: ['Tenant satisfaction score: 94%', 'All 5 rooms re-let within 2 weeks of vacancy', 'No formal disputes raised'],
  }],
  // Irfan's services
  ['svc-4', {
    id: 'svc-4',
    customerId: 'user-irfan',
    propertyId: 'prop-4',
    serviceName: 'Property Management',
    startDate: '2024-02-15',
    status: 'Active',
    benefits: ['Lease renewal secured at 12% uplift', 'Service charge reconciliation completed on time', 'Emergency repairs resolved within 4 hours average'],
  }],
  ['svc-5', {
    id: 'svc-5',
    customerId: 'user-irfan',
    propertyId: 'prop-5',
    serviceName: 'Lettings Consultancy',
    startDate: '2024-03-12',
    status: 'Active',
    benefits: ['Tenant found within 10 days of listing', 'Referencing completed with zero issues', 'Above-market rent achieved by 8%'],
  }],
  // Adamya's services
  ['svc-6', {
    id: 'svc-6',
    customerId: 'user-adamya',
    propertyId: 'prop-6',
    serviceName: 'Property Management',
    startDate: '2024-03-05',
    status: 'Active',
    benefits: ['All 6 student rooms fully let for academic year', 'Maintenance response time under 24 hours', 'Rental income increased 5% year-on-year'],
  }],
  ['svc-7', {
    id: 'svc-7',
    customerId: 'user-adamya',
    propertyId: 'prop-6',
    serviceName: 'Compliance & Legal',
    startDate: '2024-03-05',
    status: 'Active',
    benefits: ['HMO licence renewed on time', 'Fire safety audit passed with no actions', 'All tenancy agreements fully compliant'],
  }],
])

export const getServicesByCustomer = (customerId: string) =>
  Array.from(customerServices.values()).filter(s => s.customerId === customerId)

export const getAllCustomers = () =>
  Array.from(users.values()).filter(u => u.role === 'customer')
