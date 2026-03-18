'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getPublicSupabaseEnv } from '@/lib/env'

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv()

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
