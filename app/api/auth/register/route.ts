import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail, createUser, hash } from '@/lib/store'

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  company:  z.string().optional(),
  phone:    z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if email already in use
    if (findUserByEmail(data.email)) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists.' }, { status: 409 })
    }

    createUser({
      name:         data.name,
      email:        data.email,
      passwordHash: hash(data.password),
      role:         'customer',
      company:      data.company,
      phone:        data.phone,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 })
  }
}
