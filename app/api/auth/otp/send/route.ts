import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const schema = z.object({
  method: z.enum(['email', 'phone']),
  email:  z.string().email().optional(),
  phone:  z.string().optional(),
  name:   z.string().optional(),
})

const PHONE_OTP_ENABLED =
  (process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED ?? 'false').toLowerCase() === 'true'

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  return local.slice(0, 2) + '***@' + domain
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return phone.slice(0, 3) + '****' + digits.slice(-3)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { method, email, phone, name } = schema.parse(body)

    // ── Email OTP via Supabase Auth ───────────────────────────────────────────
    if (method === 'email') {
      if (!email) {
        return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
      }

      let supabase
      try {
        supabase = getSupabaseClient()
      } catch {
        return NextResponse.json(
          { error: 'Email verification is not configured. Please contact support.' },
          { status: 500 },
        )
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://3ccore.com'

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${siteUrl}/portal/customer/dashboard`,
          data: name ? { first_name: name } : undefined,
        },
      })

      if (error) {
        // Surface the actual Supabase error so configuration issues are visible.
        console.error('[OTP] Supabase signInWithOtp error:', error.message)
        const isRateLimit = /rate|too many|seconds/i.test(error.message)
        return NextResponse.json(
          { error: error.message || 'Failed to send verification email.' },
          { status: isRateLimit ? 429 : 502 },
        )
      }

      return NextResponse.json({ success: true, masked: maskEmail(email) })
    }

    // ── Phone / SMS OTP ───────────────────────────────────────────────────────
    if (method === 'phone') {
      if (!phone) {
        return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
      }

      if (!PHONE_OTP_ENABLED) {
        return NextResponse.json(
          {
            error:
              'Phone verification is coming soon. We will verify your phone number once the SMS service is connected.',
          },
          { status: 503 },
        )
      }

      // Phone OTP path — ready-to-enable behind NEXT_PUBLIC_PHONE_OTP_ENABLED flag.
      // Requires an SMS provider (Twilio / MessageBird / Vonage) connected in
      // Supabase Dashboard → Authentication → Providers → Phone.
      let supabase
      try {
        supabase = getSupabaseClient()
      } catch {
        return NextResponse.json(
          { error: 'Phone verification is not configured. Please contact support.' },
          { status: 500 },
        )
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      })

      if (error) {
        console.error('[OTP] Supabase phone OTP error:', error.message)
        const isRateLimit = /rate|too many|seconds/i.test(error.message)
        return NextResponse.json(
          { error: error.message || 'Failed to send SMS code.' },
          { status: isRateLimit ? 429 : 502 },
        )
      }

      return NextResponse.json({ success: true, masked: maskPhone(phone) })
    }

    return NextResponse.json({ error: 'Invalid method.' }, { status: 400 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }
    console.error('[OTP] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
