import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    // Admin routes — admin only
    if (pathname.startsWith('/portal/admin') && !pathname.startsWith('/portal/admin/login')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/portal/admin/login', req.url))
      }
    }

    // Customer routes — customer only (admin can't use customer portal)
    if (pathname.startsWith('/portal/customer')) {
      if (role !== 'customer') {
        return NextResponse.redirect(new URL('/portal/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl
        // Public portal pages
        if (
          pathname === '/portal/login' ||
          pathname === '/portal/register' ||
          pathname === '/portal/admin/login'
        ) return true
        // Everything else requires a token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/portal/:path*'],
}
