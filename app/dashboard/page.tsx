import DashboardOverview from '@/components/dashboard/DashboardOverview'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  if (!hasPublicSupabaseEnv()) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const result = await supabase.auth.getUser()
  const displayName = result.data.user?.email?.split('@')[0] ?? 'investor'

  return <DashboardOverview displayName={displayName} />
}
