import { findUserByEmail } from '@/lib/store'
import { createAdminClient } from '@/lib/supabase'

// ── Email existence check ───────────────────────────────────────────────────
// The in-memory `lib/store` is reset between Vercel serverless invocations,
// so a duplicate registration check that only uses it will miss most existing
// users in production. Supabase Auth creates a row in `public.users` (via the
// handle_new_user trigger) the first time `signInWithOtp` is called for an
// email — checking that table is the authoritative source.
//
// We still check the in-memory store first to catch the demo/seeded accounts
// that aren't in Supabase yet (Shubham/Irfan/Adamya × roles).

export async function emailExists(email: string): Promise<boolean> {
  if (!email) return false

  // 1) Seeded / in-process users
  if (findUserByEmail(email)) return true

  // 2) Persistent: anyone who has gone through signInWithOtp / register
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('users')
      .select('Email')
      .ilike('Email', email)
      .limit(1)
      .maybeSingle()
    if (error) {
      // Don't block registration on a Supabase outage — log and treat as
      // "doesn't exist". The final /api/auth/register call still has a
      // safety net to surface conflicts.
      console.warn('[emailExists] Supabase check failed:', error.message)
      return false
    }
    return !!data
  } catch (err) {
    console.warn('[emailExists] Supabase admin unavailable:', err)
    return false
  }
}
