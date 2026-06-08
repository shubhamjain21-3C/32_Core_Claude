import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail, hash, updateUserPasswordByEmail } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Step 2 of forgot-password: verify the OTP code via Supabase and set the
// new password on the user. We re-check the email is registered here
// (didn't reveal it in step 1) before issuing the password update.

const schema = z.object({
  email:       z.string().email(),
  otpCode:     z.string().length(6, 'Verification code must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, otpCode, newPassword } = schema.parse(body)

    let supabase
    try {
      supabase = getSupabaseClient()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Email verification is not configured.' },
        { status: 500 },
      )
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type:  'email',
    })

    if (verifyError) {
      const msg = verifyError.message.toLowerCase()
      const friendly =
        msg.includes('expired') ? 'Your verification code has expired. Please request a new one.'
        : msg.includes('invalid') || msg.includes('mismatch') ? 'Incorrect verification code. Please try again.'
        : verifyError.message || 'Verification failed. Please try again.'
      return NextResponse.json({ success: false, message: friendly }, { status: 400 })
    }

    // Discard the Supabase session — we don't use it for portal sessions
    try { await supabase.auth.signOut() } catch { /* ignore */ }

    // Only update the password if the email is actually registered. If not, we
    // return a generic success message — the email-verification step already
    // proved the requester owns the inbox, but we still won't create accounts
    // here.
    const user = findUserByEmail(email)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, the password has been updated.',
      })
    }

    const ok = updateUserPasswordByEmail(email, hash(newPassword))
    if (!ok) {
      return NextResponse.json(
        { success: false, message: 'Could not update password. Please contact support.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: err.errors[0]?.message ?? 'Invalid request.' },
        { status: 400 },
      )
    }
    console.error('[forgot-password.reset] error:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
