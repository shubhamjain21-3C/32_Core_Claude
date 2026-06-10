import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createUser, hashPassword } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase'
import { isFullyRegistered } from '@/lib/email-exists'
import { writeCustomerProfile } from '@/lib/users-db'

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
      // Surface the real Supabase error message in logs and the response
      // so we can diagnose what's actually wrong (expired, already used,
      // rate limited, wrong type, etc.).
      console.error('[register] verifyOtp failed:', {
        email:  data.email,
        method: data.otpMethod,
        code:   verifyError.code ?? null,
        status: verifyError.status ?? null,
        name:   verifyError.name,
        msg:    verifyError.message,
      })
      const msg = verifyError.message.toLowerCase()
      const friendly =
        msg.includes('expired')                          ? 'Your verification code has expired. Please request a new one.'
        : msg.includes('invalid') || msg.includes('mismatch') ? 'Incorrect verification code. Please try again.'
        : msg.includes('rate')                           ? 'Too many attempts. Please wait a minute and try again.'
        : verifyError.message
                        ? `Verification failed: ${verifyError.message}`
                        : 'Verification failed. Please try again.'
      return NextResponse.json(
        { success: false, message: friendly, supabaseError: verifyError.message },
        { status: 400 },
      )
    }

    // ── Sign out the Supabase session — we use NextAuth for portal sessions ───
    try {
      await supabase.auth.signOut()
    } catch {
      /* ignore — we just don't want the Supabase session sticking around */
    }

    // Use the STRICT check — we don't want to reject the user against the
    // stub row that our own signInWithOtp just created via the
    // handle_new_user trigger. Only block when a previous registration
    // actually wrote a password_hash or Lastname onto public.users.
    if (await isFullyRegistered(data.email)) {
      return NextResponse.json(
        {
          success: false,
          code:    'EMAIL_EXISTS',
          message: 'An account with this email already exists. Please sign in or reset your password.',
        },
        { status: 409 },
      )
    }

    const fullName     = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ')
    const passwordHash = await hashPassword(data.password)

    // 1) In-memory store — kept for the current process so the same Vercel
    //    instance can serve the auto-signin straight after register.
    createUser({
      name:         fullName,
      email:        data.email,
      passwordHash,
      role:         'customer',
      portalRole:   data.portalRole,
      phone:        data.phone || undefined,
      company:      data.company || undefined,
    })

    // 2) Persistent — write the full profile + password_hash onto
    //    public.users so logins work across serverless instances and
    //    forgot-password can verify the user exists.
    const persistedToDb = await writeCustomerProfile({
      email:        data.email,
      firstName:    data.firstName,
      middleName:   data.middleName,
      lastName:     data.lastName,
      phone:        data.phone,
      company:      data.company,
      passwordHash,
      portalRoleCode: data.portalRole,
    })

    return NextResponse.json({ success: true, persistedToDb })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 })
    }
    console.error('[register] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 })
  }
}
