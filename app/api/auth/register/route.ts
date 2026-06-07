import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail, createUser, hash } from '@/lib/store'
import { verifyOtp } from '@/lib/otp-store'

const registerSchema = z.object({
  firstName:  z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName:   z.string().min(1, 'Last name is required'),
  dob:        z.string().min(1, 'Date of birth is required'),
  email:      z.string().email('Invalid email address'),
  phone:      z.string().optional(),
  company:    z.string().optional(),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
  portalRole: z.enum(['property_manager', 'tenant', 'student']).optional(),
  otpCode:    z.string().length(6, 'Verification code must be 6 digits'),
  otpMethod:  z.enum(['email', 'phone']),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Verify OTP before creating account
    const otpKey = data.otpMethod === 'email'
      ? `email:${data.email.toLowerCase()}`
      : `phone:${data.phone}`

    if (!verifyOtp(otpKey, data.otpCode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code. Please request a new one.' },
        { status: 400 }
      )
    }

    if (findUserByEmail(data.email)) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ')

    createUser({
      name:         fullName,
      email:        data.email,
      passwordHash: hash(data.password),
      role:         'customer',
      portalRole:   data.portalRole,
      phone:        data.phone || undefined,
      company:      data.company || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 })
  }
}
