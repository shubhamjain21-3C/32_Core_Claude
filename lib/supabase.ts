import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Public browser client — instantiated lazily so the module can be imported
// at build time even when env vars are absent (e.g. Vercel Preview builds).
export function getSupabaseClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient<Database>(url, anon)
}

// Server-side admin client — bypasses RLS. Backend/API routes only, never expose publicly.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
