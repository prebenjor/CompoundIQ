'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

export default function DashboardTopBar({ user }: { user: User }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createBrowserSupabaseClient()

  const initials = (user.email ?? 'U')[0].toUpperCase()
  const displayEmail = user.email ?? ''

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-left">
        {/* Mobile hamburger placeholder — sidebar handles mobile via CSS */}
      </div>

      <div className="dash-topbar-right">
        <div className="dash-user-menu">
          <button
            className="dash-avatar"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="User menu"
          >
            {initials}
          </button>

          {menuOpen && (
            <>
              <div className="dash-user-dropdown">
                <div className="dash-user-info">
                  <span className="dash-user-email">{displayEmail}</span>
                  <span className="dash-user-plan">Gratis plan</span>
                </div>
                <div className="dash-dropdown-divider" />
                <a href="/dashboard/settings" className="dash-dropdown-item" onClick={() => setMenuOpen(false)}>
                  Innstillinger
                </a>
                <a href="/dashboard/upgrade" className="dash-dropdown-item" onClick={() => setMenuOpen(false)}>
                  Oppgrader til Pro ✦
                </a>
                <div className="dash-dropdown-divider" />
                <button className="dash-dropdown-item dash-dropdown-signout" onClick={signOut}>
                  Logg ut
                </button>
              </div>
              <div className="dash-dropdown-backdrop" onClick={() => setMenuOpen(false)} />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
