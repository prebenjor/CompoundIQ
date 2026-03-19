import SettingsPanel from '@/components/dashboard/SettingsPanel'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function DashboardSettingsPage() {
  if (!hasPublicSupabaseEnv()) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const result = await supabase.auth.getUser()
  const userEmail = result.data.user?.email

  return <SettingsPanel userEmail={userEmail} />
}
