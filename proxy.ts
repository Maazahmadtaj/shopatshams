import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    if (pathname.startsWith('/admin') && (token as any)?.role !== 'admin') {
      return NextResponse.redirect(new URL('/account/login?error=unauthorized', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl
        if (pathname.startsWith('/admin')) return (token as any)?.role === 'admin'
        if (pathname === '/account' || pathname === '/account/orders') return !!token
        return true
      },
    },
  }
)

export const config = { matcher: ['/admin/:path*', '/account', '/account/orders'] }
