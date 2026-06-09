import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import {
  findUserByEmail,
  verifyPassword,
  hashPassword,
  isLegacyHash,
} from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase'
import {
  findCustomerByEmail,
  portalRoleCodeFromId,
  updateCustomerPassword,
} from '@/lib/users-db'
import type { UserRole, PortalRole } from '@/types'

declare module 'next-auth' {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; role: UserRole; portalRole?: PortalRole }
  }
  interface User {
    id: string
    role: UserRole
    portalRole?: PortalRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    portalRole?: PortalRole
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Customer login ────────────────────────────────────────────────────────
    CredentialsProvider({
      id: 'customer-login',
      name: 'Customer',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const plain = credentials.password

        // 1) Persistent — try Supabase public.users first. Survives every
        //    Vercel function instance (the in-memory store doesn't).
        const dbUser = await findCustomerByEmail(credentials.email)
        if (dbUser?.password_hash) {
          const ok = await verifyPassword(plain, dbUser.password_hash)
          if (ok) {
            // Lazy migration: legacy sha256 hashes get re-hashed to bcrypt
            // on the user's first successful login, transparently.
            if (isLegacyHash(dbUser.password_hash)) {
              try {
                const upgraded = await hashPassword(plain)
                await updateCustomerPassword(dbUser.Email, upgraded)
                console.log('[customer-login] upgraded legacy hash for', dbUser.Email)
              } catch (err) {
                console.warn('[customer-login] hash upgrade failed:', err)
              }
            }
            const portalRole = await portalRoleCodeFromId(dbUser.portal_role_id)
            const fullName = [dbUser.FirstName, dbUser.MiddleName, dbUser.Lastname]
              .filter(Boolean).join(' ').trim() || dbUser.Email
            return {
              id:        dbUser.User_id,
              name:      fullName,
              email:     dbUser.Email,
              role:      'customer' as UserRole,
              portalRole: (portalRole ?? undefined) as PortalRole | undefined,
            }
          }
        }

        // 2) Fallback — in-memory store, used by the 9 seeded demo accounts
        //    that haven't gone through the Supabase registration flow.
        const memUser = findUserByEmail(credentials.email)
        if (memUser && memUser.role === 'customer') {
          const ok = await verifyPassword(plain, memUser.passwordHash)
          if (ok) {
            return {
              id:        memUser.id,
              name:      memUser.name,
              email:     memUser.email,
              role:      'customer' as UserRole,
              portalRole: memUser.portalRole,
            }
          }
        }

        return null
      },
    }),

    // ── Admin login (2-step: password + email OTP) ────────────────────────────
    // Step 1: front-end calls POST /api/auth/admin/start-login to verify the
    // password and trigger a Supabase OTP email. Step 2: this provider runs
    // when the admin submits the 6-digit code — it re-verifies the password
    // AND validates the OTP via Supabase before issuing a NextAuth session.
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
        otpCode:  { label: 'OTP Code', type: 'text'     },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.otpCode) return null

        const adminEmail    = process.env.PORTAL_ADMIN_EMAIL    || 'admin@3ccore.com'
        const adminPassword = process.env.PORTAL_ADMIN_PASSWORD || ''
        if (
          !adminPassword ||
          credentials.email.toLowerCase() !== adminEmail.toLowerCase() ||
          credentials.password !== adminPassword
        ) {
          return null
        }

        // Validate the OTP code against Supabase Auth
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.auth.verifyOtp({
            email: adminEmail,
            token: credentials.otpCode,
            type:  'email',
          })
          if (error) {
            console.warn('[admin-login] OTP verify failed:', error.message)
            return null
          }
          // Discard the Supabase session — NextAuth owns admin sessions
          try { await supabase.auth.signOut() } catch { /* ignore */ }
        } catch (err) {
          console.error('[admin-login] OTP verify threw:', err)
          return null
        }

        return { id: 'admin', name: '3C Core Admin', email: adminEmail, role: 'admin' as UserRole }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  pages: { signIn: '/portal/login' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id         = user.id
        token.role       = (user as { role: UserRole }).role
        token.portalRole = (user as { portalRole?: PortalRole }).portalRole
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id         = token.id
        session.user.role       = token.role
        session.user.portalRole = token.portalRole
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
