'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function DashboardTopBar({
  user,
}: {
  user: User
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = (user.email ?? 'U')[0].toUpperCase()
  const displayEmail = user.email ?? 'ukjent@compoundiq.no'

  async function signOut() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()

    router.push('/')
    router.refresh()
  }

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-left" />

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
                  <span className="dash-user-plan">Gratis plan</span>
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
                  Logg ut
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
