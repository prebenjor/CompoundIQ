import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'
import { getPublicSupabaseEnv } from '@/lib/env'

// Middleware Supabase client (reads/writes cookies on request/response)
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })
}
