import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/client/sign-in') || 
                     request.nextUrl.pathname.startsWith('/client/sign-up') 
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin/sign-in')

  if (!token && !isAuthPage && !isAdminPage) {
    return NextResponse.redirect(new URL('/client/sign-in', request.url))
  }

  if (token) {
      if (isAdminPage) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else if (isAuthPage) {
        return NextResponse.redirect(new URL('/client/dashboard', request.url))
      }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 