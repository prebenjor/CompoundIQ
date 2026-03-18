'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function DashboardTopBar({
  user,
  isDemoMode,
}: {
  user?: User
  isDemoMode: boolean
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase =
    !isDemoMode && hasPublicSupabaseEnv() ? createBrowserSupabaseClient() : null

  const initials = (user?.email ?? 'D')[0].toUpperCase()
  const displayEmail = user?.email ?? 'demo@compoundiq.local'

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut()
    }

    router.push('/')
    router.refresh()
  }

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-left">
        {isDemoMode ? (
          <span className="dash-demo-copy">Demo mode without Supabase</span>
        ) : null}
      </div>

      <div className="dash-topbar-right">
        <div className="dash-user-menu">
          <button
            className="dash-avatar"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="User menu"
          >
            {initials}
          </button>

          {menuOpen ? (
            <>
              <div className="dash-user-dropdown">
                <div className="dash-user-info">
                  <span className="dash-user-email">{displayEmail}</span>
                  <span className="dash-user-plan">
                    {isDemoMode ? 'Local demo' : 'Gratis plan'}
                  </span>
                </div>
                <div className="dash-dropdown-divider" />
                <Link
                  href="/dashboard/settings"
                  className="dash-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Innstillinger
                </Link>
                <Link
                  href="/dashboard/upgrade"
                  className="dash-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Oppgrader til Pro
                </Link>
                <div className="dash-dropdown-divider" />
                <button
                  className="dash-dropdown-item dash-dropdown-signout"
                  onClick={signOut}
                >
                  {isDemoMode ? 'Til forsiden' : 'Logg ut'}
                </button>
              </div>
              <div
                className="dash-dropdown-backdrop"
                onClick={() => setMenuOpen(false)}
              />
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
