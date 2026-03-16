'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Oversikt', icon: '⊞' },
  { href: '/dashboard/portfolio', label: 'Portefølje', icon: '💼' },
  { href: '/dashboard/calculator', label: 'Kalkulator', icon: '📊' },
  { href: '/dashboard/ask-bsu', label: 'ASK & BSU', icon: '🏦' },
  { href: '/dashboard/integrations', label: 'Integrasjoner', icon: '🔗', soon: true },
  { href: '/dashboard/settings', label: 'Innstillinger', icon: '⚙' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="dash-sidebar">
      <Link href="/" className="dash-sidebar-logo">
        <span className="logo-icon">▲</span>
        CompoundIQ
      </Link>

      <nav className="dash-nav">
        {NAV.map(({ href, label, icon, soon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`dash-nav-item${active ? ' active' : ''}${soon ? ' soon' : ''}`}
            >
              <span className="dash-nav-icon">{icon}</span>
              <span className="dash-nav-label">{label}</span>
              {soon && <span className="dash-nav-soon">Snart</span>}
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
