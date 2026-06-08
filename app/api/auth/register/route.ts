import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createUser, hash } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase'
import { emailExists } from '@/lib/email-exists'

export const dynamic = 'force-dynamic'

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

    // ── Verify OTP via Supabase Auth ──────────────────────────────────────────
    let supabase
    try {
      supabase = getSupabaseClient()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Verification service is not configured. Please contact support.' },
        { status: 500 },
      )
    }

    const { error: verifyError } =
      data.otpMethod === 'email'
        ? await supabase.auth.verifyOtp({
            email: data.email,
            token: data.otpCode,
            type:  'email',
          })
        : await supabase.auth.verifyOtp({
            phone: data.phone ?? '',
            token: data.otpCode,
            type:  'sms',
          })

    if (verifyError) {
      const msg = verifyError.message.toLowerCase()
      const friendly =
        msg.includes('expired') ? 'Your verification code has expired. Please request a new one.'
        : msg.includes('invalid') || msg.includes('mismatch') ? 'Incorrect verification code. Please try again.'
        : verifyError.message || 'Verification failed. Please try again.'
      return NextResponse.json({ success: false, message: friendly }, { status: 400 })
    }

    // ── Sign out the Supabase session — we use NextAuth for portal sessions ───
    try {
      await supabase.auth.signOut()
    } catch {
      /* ignore — we just don't want the Supabase session sticking around */
    }

    if (await emailExists(data.email)) {
      return NextResponse.json(
        {
          success: false,
          code:    'EMAIL_EXISTS',
          message: 'An account with this email already exists. Please sign in or reset your password.',
        },
        { status: 409 },
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
    console.error('[register] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 })
  }
}
