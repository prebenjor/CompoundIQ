'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  calculatePortfolioSummary,
  defaultDashboardSettings,
  fetchDashboardSettingsBundle,
  fetchPortfolioHoldings,
  formatCurrency,
  formatPercent,
  getDataErrorMessage,
  type DashboardSettings,
  type PortfolioHolding,
} from '@/lib/dashboard-data'

interface DashboardOverviewProps {
  displayName: string
}

export default function DashboardOverview({ displayName }: DashboardOverviewProps) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [settings, setSettings] = useState<DashboardSettings>(defaultDashboardSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [portfolio, bundle] = await Promise.all([
          fetchPortfolioHoldings(),
          fetchDashboardSettingsBundle(),
        ])

        if (!active) {
          return
        }

        setHoldings(portfolio)
        setSettings(bundle.settings)
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error ? getDataErrorMessage(loadError.message) : getDataErrorMessage()
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [])

  const summary = calculatePortfolioSummary(holdings, settings)
  const hasHoldings = holdings.length > 0
  const displayGain =
    summary.totalCost > 0
      ? `${formatCurrency(summary.totalGain)} (${formatPercent(summary.totalGainPct)})`
      : loading
        ? 'Laster...'
        : 'Ingen data ennå'

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <div className="dash-header-row">
            <h1 className="dash-title">Hei, {displayName}</h1>
          </div>
          <p className="dash-subtitle">Her er oversikten din akkurat nå.</p>
        </div>
        <Link href="/dashboard/portfolio" className="btn btn-primary">
          + Legg til portefølje
        </Link>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      <div className="dash-stats">
        <StatCard
          label="Total porteføljeverdi"
          value={hasHoldings ? formatCurrency(summary.totalValue) : loading ? 'Laster...' : 'Ingen data'}
          hint="Bygges fra manuelle posisjoner lagret på kontoen din."
        />
        <StatCard
          label="Total avkastning"
          value={displayGain}
          hint="Sammenligner kostpris mot estimert markedsverdi."
        />
        <StatCard
          label="Estimert verdi om 10 år"
          value={
            hasHoldings ? formatCurrency(summary.projectedValue10y) : loading ? 'Laster...' : 'Ingen data'
          }
          hint={`Basert på ${settings.expectedReturn.toFixed(1).replace('.', ',')} % forventet avkastning og ${formatCurrency(settings.monthlyContribution)} i månedlig sparing.`}
        />
        <StatCard
          label="ASK-andel"
          value={hasHoldings ? formatPercent(summary.askShare) : loading ? 'Laster...' : 'Ingen data'}
          hint="Andel av dagens porteføljeverdi som ligger på ASK."
        />
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Kom i gang</h2>
        <div className="dash-cards">
          <QuickCard
            icon="Chart"
            title="Kalkulator"
            desc="Bruk renters rente-kalkulatoren direkte fra dashboardet."
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
            desc="Se hva som kommer for broker-import og andre koblinger, og meld interesse."
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
