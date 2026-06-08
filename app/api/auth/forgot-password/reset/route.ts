import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hash, updateUserPasswordByEmail } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase'
import { emailExists } from '@/lib/email-exists'
import { updateCustomerPassword } from '@/lib/users-db'

export const dynamic = 'force-dynamic'

// Step 2 of forgot-password: verify the OTP code via Supabase and set the
// new password on the user (both in-memory store and Supabase public.users
// so the change survives serverless cold starts).

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

    // Only update if the email is registered (we already proved inbox ownership
    // via the OTP — but we still shouldn't create accounts here).
    const hasAccount = await emailExists(email)
    if (!hasAccount) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, the password has been updated.',
      })
    }

    const newHash = hash(newPassword)

    // Persistent — update Supabase public.users.password_hash
    const dbOk = await updateCustomerPassword(email, newHash)
    // In-memory — covers the seeded demo accounts in the same Vercel instance
    updateUserPasswordByEmail(email, newHash)

    if (!dbOk) {
      // We updated the in-memory copy but failed to persist — return a soft
      // success so the user can sign in immediately on this instance, but
      // log the issue.
      console.warn('[forgot-password.reset] password update did not persist to Supabase')
    }

    return NextResponse.json({ success: true, persisted: dbOk })
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
