import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardTopBar from '@/components/dashboard/DashboardTopBar'

export const metadata = {
  title: 'Dashboard — CompoundIQ',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="dashboard-root">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardTopBar user={user} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}
