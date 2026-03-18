import { createClient } from '@supabase/supabase-js'
import { getPublicSupabaseEnv, getServerSupabaseEnv } from '@/lib/env'

export function createServerClient() {
  const { supabaseUrl } = getPublicSupabaseEnv()
  const { serviceRoleKey } = getServerSupabaseEnv()

  return createClient(
    supabaseUrl,
    serviceRoleKey
  )
}
