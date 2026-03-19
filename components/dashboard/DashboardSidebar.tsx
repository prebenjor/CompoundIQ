'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { fetchDashboardSettingsBundle } from '@/lib/dashboard-data'

interface NavItem {
  href: string
  label: string
  icon: string
  soon?: boolean
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [bsuEnabled, setBsuEnabled] = useState(true)

  useEffect(() => {
    let active = true

    async function loadSettings() {
      try {
        const bundle = await fetchDashboardSettingsBundle()

        if (active) {
          setBsuEnabled(bundle.settings.bsuEnabled)
        }
      } catch {
        if (active) {
          setBsuEnabled(true)
        }
      }
    }

    void loadSettings()

    return () => {
      active = false
    }
  }, [])

  const nav = useMemo(
    () =>
      [
        { href: '/dashboard', label: 'Oversikt', icon: 'OV' },
        { href: '/dashboard/budget', label: 'Budsjett', icon: 'BD' },
        { href: '/dashboard/goals', label: 'Mål', icon: 'ML' },
        { href: '/dashboard/portfolio', label: 'Portefølje', icon: 'PF' },
        { href: '/dashboard/calculator', label: 'Kalkulator', icon: 'KR' },
        { href: '/dashboard/ask-bsu', label: bsuEnabled ? 'ASK og BSU' : 'ASK', icon: 'AB' },
        { href: '/dashboard/integrations', label: 'Integrasjoner', icon: 'IN', soon: true },
        { href: '/dashboard/settings', label: 'Innstillinger', icon: 'ST' },
      ] satisfies NavItem[],
    [bsuEnabled]
  )

  return (
    <aside className="dash-sidebar">
      <Link href="/" className="dash-sidebar-logo">
        <span className="logo-icon">▲</span>
        CompoundIQ
      </Link>

      <nav className="dash-nav">
        {nav.map(({ href, label, icon, soon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)

          return (
            <Link key={href} href={href} className={`dash-nav-item${active ? ' active' : ''}`}>
              <span className="dash-nav-icon">{icon}</span>
              <span className="dash-nav-label">{label}</span>
              {soon ? <span className="dash-nav-soon">Preview</span> : null}
            </Link>
          )
        })}
      </nav>

      <div className="dash-sidebar-footer">
        <div className="dash-plan-badge">Gratis plan</div>
        <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm btn-full">
          Oppgrader til Pro
        </Link>
      </div>
    </aside>
  )
}
