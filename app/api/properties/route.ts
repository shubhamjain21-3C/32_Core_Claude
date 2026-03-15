import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getPropertiesByCustomer, createProperty, properties } from '@/lib/store'

const propertySchema = z.object({
  address:     z.string().min(5, 'Address is required'),
  postcode:    z.string().min(3, 'Postcode is required'),
  type:        z.enum(['Residential', 'HMO', 'Commercial', 'Student', 'Holiday Let']),
  bedrooms:    z.number().min(0),
  monthlyRent: z.number().min(0),
  status:      z.enum(['Occupied', 'Vacant', 'Under Management', 'For Letting']),
  serviceIds:  z.array(z.string()).default([]),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = session.user.role
  if (role === 'admin') {
    return NextResponse.json(Array.from(properties.values()))
  }
  return NextResponse.json(getPropertiesByCustomer(session.user.id))
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = propertySchema.parse(body)
    const property = createProperty({ ...data, customerId: session.user.id })
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}
