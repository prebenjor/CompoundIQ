import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getPublicSupabaseEnv } from '@/lib/env'

// Server Component / Route Handler client (reads cookies for session)
export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv()
  const cookieStore = await cookies()

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component — cookies will be set by middleware
        }
      },
    },
  })
}
