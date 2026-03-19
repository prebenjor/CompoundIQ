import { NextResponse, type NextRequest } from 'next/server'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createMiddlewareClient } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  if (!hasPublicSupabaseEnv()) {
    if (pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'missing_config')
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  const supabase = createMiddlewareClient(request, response)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (pathname.startsWith('/dashboard') && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (
    user &&
    (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/signup'],
}
