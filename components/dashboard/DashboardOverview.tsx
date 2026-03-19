'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  fetchBudgetSavingsThread,
  formatBudgetCurrency,
  type BudgetSavingsThread,
} from '@/lib/budget-data'
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
  const [budgetThread, setBudgetThread] = useState<BudgetSavingsThread | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [portfolio, bundle, budget] = await Promise.all([
          fetchPortfolioHoldings(),
          fetchDashboardSettingsBundle(),
          fetchBudgetSavingsThread().catch(() => null),
        ])

        if (!active) {
          return
        }

        setHoldings(portfolio)
        setSettings(bundle.settings)
        setBudgetThread(budget)
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
        : 'Ingen data enda'

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <div className="dash-header-row">
            <h1 className="dash-title">Hei, {displayName}</h1>
          </div>
          <p className="dash-subtitle">Her er oversikten din akkurat naa.</p>
        </div>
        <Link href="/dashboard/portfolio" className="btn btn-primary">
          + Legg til portefolje
        </Link>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      <div className="dash-stats">
        <StatCard
          label="Total portefoljeverdi"
          value={hasHoldings ? formatCurrency(summary.totalValue) : loading ? 'Laster...' : 'Ingen data'}
          hint="Bygges fra manuelle posisjoner lagret paa kontoen din."
        />
        <StatCard
          label="Total avkastning"
          value={displayGain}
          hint="Sammenligner kostpris mot estimert markedsverdi."
        />
        <StatCard
          label="Estimert verdi om 10 aar"
          value={
            hasHoldings ? formatCurrency(summary.projectedValue10y) : loading ? 'Laster...' : 'Ingen data'
          }
          hint={`Basert paa ${settings.expectedReturn.toFixed(1).replace('.', ',')} % forventet avkastning og ${formatCurrency(settings.monthlyContribution)} i maanedlig sparing.`}
        />
        <StatCard
          label="ASK-andel"
          value={hasHoldings ? formatPercent(summary.askShare) : loading ? 'Laster...' : 'Ingen data'}
          hint="Andel av dagens portefoljeverdi som ligger paa ASK."
        />
      </div>

      <div className="dashboard-panel budget-thread-panel">
        <div className="dash-header-row">
          <h2 className="dash-section-title">Fra budsjett til sparing</h2>
          <Link href="/dashboard/budget" className="btn btn-ghost btn-sm">
            Se budsjett
          </Link>
        </div>
        {budgetThread ? (
          <div className="dash-stats dash-stats-three">
            <StatCard
              label="Kan settes av i maaneden"
              value={formatBudgetCurrency(budgetThread.availableToSave)}
              hint="Planlagt inntekt minus planlagte utgifter."
            />
            <StatCard
              label="Foreslaatt til investering"
              value={formatBudgetCurrency(budgetThread.availableToInvest)}
              hint={`${budgetThread.investmentAllocationPct.toFixed(0)} % av overskuddet sendes videre til investering.`}
            />
            <StatCard
              label="Foreslaatt til buffer og BSU"
              value={formatBudgetCurrency(
                budgetThread.availableToBuffer + budgetThread.availableToBsu
              )}
              hint={`${(
                budgetThread.bufferAllocationPct + budgetThread.bsuAllocationPct
              ).toFixed(0)} % er satt av til buffer og BSU.`}
            />
          </div>
        ) : (
          <p className="panel-copy">Laster koblingen mellom budsjett og sparing...</p>
        )}
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Kom i gang</h2>
        <div className="dash-cards">
          <QuickCard
            icon="Cash"
            title="Budsjett"
            desc="Finn realistisk overskudd hver maaned og send det videre til sparing og investering."
            href="/dashboard/budget"
            cta="Apne budsjett"
          />
          <QuickCard
            icon="Chart"
            title="Kalkulator"
            desc="Bruk renters rente-kalkulatoren med sparing hentet fra budsjettet."
            href="/dashboard/calculator"
            cta="Apne kalkulator"
          />
          <QuickCard
            icon="Port"
            title="Portefolje"
            desc="Legg inn beholdninger, kostpris og naakurs. Oversikten oppdateres automatisk."
            href="/dashboard/portfolio"
            cta="Se portefolje"
          />
          <QuickCard
            icon="ASK"
            title="ASK og BSU"
            desc="Bruk budsjettoverkuddet ditt til aa planlegge BSU, buffer og investering side om side."
            href="/dashboard/ask-bsu"
            cta="Apne planner"
          />
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Neste steg</h2>
        <div className="dashboard-panel">
          <ul className="dash-checklist">
            <li>Sett opp budsjettet ditt for aa finne realistisk sparekapasitet.</li>
            <li>Legg inn portefoljen din manuelt for aa fylle oversikten.</li>
            <li>Juster forventet avkastning og inflasjon under innstillinger.</li>
            <li>Bruk ASK og BSU-planneren for aa teste ulike spareoppsett.</li>
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
}: {
  icon: string
  title: string
  desc: string
  href: string
  cta: string
}) {
  return (
    <div className="quick-card">
      <div className="quick-card-icon quick-card-icon-text">{icon}</div>
      <div className="quick-card-body">
        <div className="quick-card-title-row">
          <h3>{title}</h3>
        </div>
        <p>{desc}</p>
      </div>
      <Link href={href} className="btn btn-ghost quick-card-btn">
        {cta}
      </Link>
    </div>
  )
}
