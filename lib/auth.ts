import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const adminEmail    = process.env.PORTAL_ADMIN_EMAIL    || 'admin@3ccore.com'
        const adminPassword = process.env.PORTAL_ADMIN_PASSWORD || ''

        if (
          credentials.email    === adminEmail &&
          credentials.password === adminPassword
        ) {
          return { id: '1', name: 'Admin', email: adminEmail }
        }
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/portal/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
