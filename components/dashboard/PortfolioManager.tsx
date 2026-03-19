'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  fetchBudgetSavingsThread,
  formatBudgetCurrency,
  type BudgetSavingsThread,
} from '@/lib/budget-data'
import {
  calculatePortfolioSummary,
  createPortfolioHolding,
  defaultDashboardSettings,
  deletePortfolioHolding,
  fetchDashboardSettingsBundle,
  fetchPortfolioHoldings,
  formatCurrency,
  formatPercent,
  getDataErrorMessage,
  projectFutureValue,
  replacePortfolioHoldings,
  sampleHoldings,
  type DashboardSettings,
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
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [settings, setSettings] = useState<DashboardSettings>(defaultDashboardSettings)
  const [budgetThread, setBudgetThread] = useState<BudgetSavingsThread | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const accountOptions = useMemo(
    () => ACCOUNT_OPTIONS.filter((option) => settings.bsuEnabled || option !== 'BSU'),
    [settings.bsuEnabled]
  )

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

  const summary = useMemo(
    () => calculatePortfolioSummary(holdings, settings),
    [holdings, settings]
  )
  const budgetProjection10y = useMemo(() => {
    if (!budgetThread || summary.totalValue <= 0) {
      return 0
    }

    return projectFutureValue(
      summary.totalValue,
      budgetThread.availableToInvest,
      settings.expectedReturn,
      10
    )
  }, [budgetThread, settings.expectedReturn, summary.totalValue])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextHolding: Omit<PortfolioHolding, 'id'> = {
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
      setError('Fyll inn gyldige verdier for posisjonen før du lagrer.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const next = await createPortfolioHolding(nextHolding)
      setHoldings(next)
      setForm(emptyForm)
    } catch (saveError) {
      const message =
        saveError instanceof Error ? getDataErrorMessage(saveError.message) : getDataErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function removeHolding(id: string) {
    setSaving(true)
    setError(null)

    try {
      const next = await deletePortfolioHolding(id)
      setHoldings(next)
    } catch (removeError) {
      const message =
        removeError instanceof Error
          ? getDataErrorMessage(removeError.message)
          : getDataErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function loadExamplePortfolio() {
    setSaving(true)
    setError(null)

    try {
      const next = await replacePortfolioHoldings(
        sampleHoldings.filter((holding) => settings.bsuEnabled || holding.accountType !== 'BSU')
      )
      setHoldings(next)
    } catch (sampleError) {
      const message =
        sampleError instanceof Error
          ? getDataErrorMessage(sampleError.message)
          : getDataErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function clearPortfolio() {
    setSaving(true)
    setError(null)

    try {
      const next = await replacePortfolioHoldings([])
      setHoldings(next)
    } catch (clearError) {
      const message =
        clearError instanceof Error ? getDataErrorMessage(clearError.message) : getDataErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Portefølje</h1>
          <p className="dash-subtitle">
            Legg inn beholdningene dine manuelt. Data lagres på brukeren din i Supabase.
          </p>
        </div>
        <div className="dash-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadExamplePortfolio}
            disabled={saving}
          >
            Last eksempeldata
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={clearPortfolio}
            disabled={saving}
          >
            Tøm alt
          </button>
        </div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      <div className="dash-stats dash-stats-three">
        <MetricCard label="Markedsverdi" value={loading ? 'Laster...' : formatCurrency(summary.totalValue)} />
        <MetricCard
          label="Urealisert gevinst"
          value={
            loading
              ? 'Laster...'
              : `${formatCurrency(summary.totalGain)} (${formatPercent(summary.totalGainPct)})`
          }
        />
        <MetricCard label="ASK-andel" value={loading ? 'Laster...' : formatPercent(summary.askShare)} />
      </div>

      {budgetThread ? (
        <div className="dashboard-panel budget-thread-panel">
          <div className="dash-header-row">
            <h2 className="dash-section-title">Budsjett til investering</h2>
            <span className="stat-label">
              {budgetThread.investmentAllocationPct.toFixed(0)} % til investering
            </span>
          </div>
          <div className="dash-stats dash-stats-three">
            <MetricCard
              label="Månedlig å investere"
              value={formatBudgetCurrency(budgetThread.availableToInvest)}
            />
            <MetricCard
              label={settings.bsuEnabled ? 'Til buffer og BSU' : 'Til buffer'}
              value={formatBudgetCurrency(
                budgetThread.availableToBuffer + (settings.bsuEnabled ? budgetThread.availableToBsu : 0)
              )}
            />
            <MetricCard
              label="Portefølje om 10 år"
              value={
                summary.totalValue > 0
                  ? formatCurrency(budgetProjection10y)
                  : 'Legg inn posisjoner først'
              }
            />
          </div>
          <p className="panel-copy">
            Denne anbefalingen hentes fra budsjettet ditt og bruker fordelingen du har satt i
            innstillinger.
          </p>
        </div>
      ) : null}

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
                  {accountOptions.map((option) => (
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
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Lagrer...' : 'Legg til posisjon'}
            </button>
          </form>
        </div>

        <div className="dashboard-panel">
          <h2 className="dash-section-title">Beholdninger</h2>
          {loading ? (
            <p className="panel-copy">Laster porteføljen din...</p>
          ) : holdings.length === 0 ? (
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
                      onClick={() => void removeHolding(holding.id)}
                      disabled={saving}
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
