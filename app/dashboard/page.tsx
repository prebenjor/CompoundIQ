import DashboardOverview from '@/components/dashboard/DashboardOverview'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const isDemoMode = !hasPublicSupabaseEnv()
  let displayName = 'investor'

  if (!isDemoMode) {
    const supabase = await createSupabaseServerClient()
    const result = await supabase.auth.getUser()
    displayName = result.data.user?.email?.split('@')[0] ?? displayName
  }

  return <DashboardOverview displayName={displayName} isDemoMode={isDemoMode} />
}
