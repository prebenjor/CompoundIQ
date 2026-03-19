import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardTopBar from '@/components/dashboard/DashboardTopBar'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const metadata = {
  title: 'Dashboard - CompoundIQ',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!hasPublicSupabaseEnv()) {
    redirect('/auth/login?error=missing_config')
  }

  const supabase = await createSupabaseServerClient()
  const result = await supabase.auth.getUser()
  const user = result.data.user

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="dashboard-root">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardTopBar user={user} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}
