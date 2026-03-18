'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  calculatePortfolioSummary,
  defaultDashboardSettings,
  formatCurrency,
  formatPercent,
  loadPortfolioHoldings,
  sampleHoldings,
  savePortfolioHoldings,
  subscribeDashboardStorage,
  type HoldingAccount,
  type PortfolioHolding,
} from '@/lib/dashboard-data'

const ACCOUNT_OPTIONS: HoldingAccount[] = ['ASK', 'Aksjer/fond', 'BSU']

const emptyForm = {
  name: '',
  ticker: '',
  shares: '1',
  averagePrice: '',
  currentPrice: '',
  accountType: 'ASK' as HoldingAccount,
}

export default function PortfolioManager() {
  const holdings = useSyncExternalStore(
    subscribeDashboardStorage,
    loadPortfolioHoldings,
    () => sampleHoldings
  )
  const [form, setForm] = useState(emptyForm)

  const summary = useMemo(
    () => calculatePortfolioSummary(holdings, defaultDashboardSettings),
    [holdings]
  )

  function updateHoldings(next: PortfolioHolding[]) {
    savePortfolioHoldings(next)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextHolding: PortfolioHolding = {
      id: `${Date.now()}`,
      name: form.name.trim(),
      ticker: form.ticker.trim().toUpperCase(),
      shares: Number(form.shares),
      averagePrice: Number(form.averagePrice),
      currentPrice: Number(form.currentPrice),
      accountType: form.accountType,
    }

    if (
      !nextHolding.name ||
      nextHolding.shares <= 0 ||
      nextHolding.averagePrice <= 0 ||
      nextHolding.currentPrice <= 0
    ) {
      return
    }

    updateHoldings([nextHolding, ...holdings])
    setForm(emptyForm)
  }

  function removeHolding(id: string) {
    updateHoldings(holdings.filter((holding) => holding.id !== id))
  }

  function loadExamplePortfolio() {
    updateHoldings(sampleHoldings)
  }

  function clearPortfolio() {
    updateHoldings([])
  }

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Portefølje</h1>
          <p className="dash-subtitle">
            Legg inn beholdningene dine manuelt. Data lagres lokalt i nettleseren.
          </p>
        </div>
        <div className="dash-actions">
          <button type="button" className="btn btn-outline" onClick={loadExamplePortfolio}>
            Last eksempeldata
          </button>
          <button type="button" className="btn btn-ghost" onClick={clearPortfolio}>
            Tøm alt
          </button>
        </div>
      </div>

      <div className="dash-stats dash-stats-three">
        <MetricCard label="Markedsverdi" value={formatCurrency(summary.totalValue)} />
        <MetricCard
          label="Urealisert gevinst"
          value={`${formatCurrency(summary.totalGain)} (${formatPercent(summary.totalGainPct)})`}
        />
        <MetricCard label="ASK-andel" value={formatPercent(summary.askShare)} />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Ny posisjon</h2>
          <form className="dashboard-form" onSubmit={handleSubmit}>
            <label>
              Navn
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="DNB Global Indeks"
                required
              />
            </label>
            <label>
              Ticker
              <input
                value={form.ticker}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ticker: event.target.value }))
                }
                placeholder="DNBGI"
              />
            </label>
            <div className="dashboard-form-row">
              <label>
                Antall
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shares}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, shares: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Konto
                <select
                  value={form.accountType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      accountType: event.target.value as HoldingAccount,
                    }))
                  }
                >
                  {ACCOUNT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="dashboard-form-row">
              <label>
                Kostpris
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.averagePrice}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      averagePrice: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Nåkurs
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.currentPrice}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      currentPrice: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>
            <button type="submit" className="btn btn-primary">
              Legg til posisjon
            </button>
          </form>
        </div>

        <div className="dashboard-panel">
          <h2 className="dash-section-title">Beholdninger</h2>
          {holdings.length === 0 ? (
            <p className="panel-copy">
              Ingen posisjoner registrert ennå. Last eksempeldata eller legg inn første posisjon.
            </p>
          ) : (
            <div className="portfolio-list">
              {holdings.map((holding) => {
                const cost = holding.shares * holding.averagePrice
                const value = holding.shares * holding.currentPrice
                const gain = value - cost
                const gainPct = cost > 0 ? (gain / cost) * 100 : 0

                return (
                  <div key={holding.id} className="portfolio-item">
                    <div>
                      <div className="portfolio-item-title">
                        <strong>{holding.name}</strong>
                        <span className="portfolio-tag">{holding.accountType}</span>
                      </div>
                      <p className="panel-copy">
                        {holding.ticker || 'Ingen ticker'} · {holding.shares} andeler
                      </p>
                    </div>
                    <div className="portfolio-item-metrics">
                      <span>{formatCurrency(value)}</span>
                      <span className={gain >= 0 ? 'metric-positive' : 'metric-negative'}>
                        {formatCurrency(gain)} ({formatPercent(gainPct)})
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeHolding(holding.id)}
                    >
                      Fjern
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value stat-value-lg">{value}</span>
    </div>
  )
}
