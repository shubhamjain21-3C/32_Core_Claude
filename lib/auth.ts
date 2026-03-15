import type { NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { findUserByEmail, hash } from '@/lib/store'
import type { UserRole } from '@/types'

declare module 'next-auth' {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; role: UserRole }
  }
  interface User {
    id: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
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
        const user = findUserByEmail(credentials.email)
        if (!user || user.role !== 'customer') return null
        if (user.passwordHash !== hash(credentials.password)) return null
        return { id: user.id, name: user.name, email: user.email, role: 'customer' }
      },
    }),

    // ── Admin login ───────────────────────────────────────────────────────────
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const adminEmail    = process.env.PORTAL_ADMIN_EMAIL    || 'admin@3ccore.com'
        const adminPassword = process.env.PORTAL_ADMIN_PASSWORD || ''
        if (credentials.email !== adminEmail || credentials.password !== adminPassword) return null
        return { id: 'admin', name: '3C Core Admin', email: adminEmail, role: 'admin' }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  pages: {
    signIn: '/portal/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id
        session.user.role = token.role
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
