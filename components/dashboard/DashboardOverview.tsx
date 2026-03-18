'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import {
  calculatePortfolioSummary,
  defaultDashboardSettings,
  formatCurrency,
  formatPercent,
  loadDashboardSettings,
  loadPortfolioHoldings,
  sampleHoldings,
  subscribeDashboardStorage,
  type DashboardSettings,
} from '@/lib/dashboard-data'

interface DashboardOverviewProps {
  displayName: string
  isDemoMode: boolean
}

export default function DashboardOverview({
  displayName,
  isDemoMode,
}: DashboardOverviewProps) {
  const holdings = useSyncExternalStore(
    subscribeDashboardStorage,
    loadPortfolioHoldings,
    () => sampleHoldings
  )
  const settings = useSyncExternalStore<DashboardSettings>(
    subscribeDashboardStorage,
    loadDashboardSettings,
    () => defaultDashboardSettings
  )

  const summary = calculatePortfolioSummary(holdings, settings)
  const hasHoldings = holdings.length > 0
  const displayGain =
    summary.totalCost > 0
      ? `${formatCurrency(summary.totalGain)} (${formatPercent(summary.totalGainPct)})`
      : 'Ingen data ennå'

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <div className="dash-header-row">
            <h1 className="dash-title">Hei, {displayName}</h1>
            {isDemoMode ? <span className="dash-mode-badge">Demo mode</span> : null}
          </div>
          <p className="dash-subtitle">
            {isDemoMode
              ? 'Prøv dashboardet lokalt. Legg inn demoporteføljen din eller koble på Supabase senere.'
              : 'Her er oversikten din akkurat nå.'}
          </p>
        </div>
        <Link href="/dashboard/portfolio" className="btn btn-primary">
          + Legg til portefølje
        </Link>
      </div>

      <div className="dash-stats">
        <StatCard
          label="Total porteføljeverdi"
          value={hasHoldings ? formatCurrency(summary.totalValue) : 'Ingen data'}
          hint="Bygges fra manuelle posisjoner i porteføljen din."
        />
        <StatCard
          label="Total avkastning"
          value={displayGain}
          hint="Sammenligner kostpris mot estimert markedsverdi."
        />
        <StatCard
          label="Estimert verdi om 10 år"
          value={hasHoldings ? formatCurrency(summary.projectedValue10y) : 'Ingen data'}
          hint={`Basert på ${settings.expectedReturn.toFixed(1).replace('.', ',')} % forventet avkastning og ${formatCurrency(settings.monthlyContribution)} i månedlig sparing.`}
        />
        <StatCard
          label="ASK-andel"
          value={hasHoldings ? formatPercent(summary.askShare) : 'Ingen data'}
          hint="Andel av dagens porteføljeverdi som ligger på ASK."
        />
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Kom i gang</h2>
        <div className="dash-cards">
          <QuickCard
            icon="Chart"
            title="Kalkulator"
            desc="Bruk den eksisterende renters rente-kalkulatoren fra dashboardet."
            href="/dashboard/calculator"
            cta="Åpne kalkulator"
          />
          <QuickCard
            icon="Port"
            title="Portefølje"
            desc="Legg inn beholdninger, kostpris og nåkurs. Oversikten oppdateres automatisk."
            href="/dashboard/portfolio"
            cta="Se portefølje"
          />
          <QuickCard
            icon="ASK"
            title="ASK og BSU"
            desc="Sammenlign ASK mot skattepliktig konto og planlegg BSU-mål med egne satser."
            href="/dashboard/ask-bsu"
            cta="Åpne planner"
          />
          <QuickCard
            icon="Sync"
            title="Integrasjoner"
            desc="Se hva som kommer for Nordnet-import og andre koblinger, og meld interesse."
            href="/dashboard/integrations"
            cta="Se integrasjoner"
            badge="Preview"
          />
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Neste steg</h2>
        <div className="dashboard-panel">
          <ul className="dash-checklist">
            <li>Legg inn porteføljen din manuelt for å fylle oversikten.</li>
            <li>Juster forventet avkastning og inflasjon under innstillinger.</li>
            <li>Bruk ASK og BSU-planneren for å teste ulike spareoppsett.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value stat-value-lg">{value}</span>
      <span className="stat-hint">{hint}</span>
    </div>
  )
}

function QuickCard({
  icon,
  title,
  desc,
  href,
  cta,
  badge,
}: {
  icon: string
  title: string
  desc: string
  href: string
  cta: string
  badge?: string
}) {
  return (
    <div className="quick-card">
      <div className="quick-card-icon quick-card-icon-text">{icon}</div>
      <div className="quick-card-body">
        <div className="quick-card-title-row">
          <h3>{title}</h3>
          {badge ? <span className="badge-soon">{badge}</span> : null}
        </div>
        <p>{desc}</p>
      </div>
      <Link href={href} className="btn btn-ghost quick-card-btn">
        {cta}
      </Link>
    </div>
  )
}
