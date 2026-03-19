'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  fetchBudgetSavingsThread,
  formatBudgetCurrency,
  type BudgetSavingsThread,
} from '@/lib/budget-data'
import { fetchDashboardSettingsBundle, formatCurrency } from '@/lib/dashboard-data'

const ASK_TAX_RATE = 0.3784

function projectAnnualSavings(
  currentBalance: number,
  annualContribution: number,
  annualReturn: number,
  years: number
) {
  let balance = currentBalance

  for (let year = 0; year < years; year += 1) {
    balance = (balance + annualContribution) * (1 + annualReturn / 100)
  }

  return balance
}

function projectMonthlyInvestment(
  principal: number,
  monthlyContribution: number,
  annualReturn: number,
  years: number
) {
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1
  let balance = principal

  for (let month = 0; month < years * 12; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
  }

  return balance
}

export default function AskBsuPlanner() {
  const [bsuBalance, setBsuBalance] = useState(120000)
  const [annualContribution, setAnnualContribution] = useState(27500)
  const [bsuReturn, setBsuReturn] = useState(5)
  const [yearsToGoal, setYearsToGoal] = useState(5)
  const [taxDeduction, setTaxDeduction] = useState(10)

  const [initialInvestment, setInitialInvestment] = useState(100000)
  const [monthlySavings, setMonthlySavings] = useState(3000)
  const [expectedReturn, setExpectedReturn] = useState(8)
  const [comparisonYears, setComparisonYears] = useState(10)
  const [budgetThread, setBudgetThread] = useState<BudgetSavingsThread | null>(null)
  const [bsuEnabled, setBsuEnabled] = useState(true)

  useEffect(() => {
    let active = true

    async function loadPlannerState() {
      try {
        const [thread, bundle] = await Promise.all([
          fetchBudgetSavingsThread(),
          fetchDashboardSettingsBundle(),
        ])

        if (!active) {
          return
        }

        setBudgetThread(thread)
        setBsuEnabled(bundle.settings.bsuEnabled)
      } catch {
        if (!active) {
          return
        }

        setBudgetThread(null)
        setBsuEnabled(true)
      }
    }

    void loadPlannerState()

    return () => {
      active = false
    }
  }, [])

  const bsuProjection = useMemo(() => {
    const projectedBalance = projectAnnualSavings(
      bsuBalance,
      annualContribution,
      bsuReturn,
      yearsToGoal
    )
    const totalContributions = annualContribution * yearsToGoal
    const estimatedDeduction = totalContributions * (taxDeduction / 100)

    return { projectedBalance, totalContributions, estimatedDeduction }
  }, [annualContribution, bsuBalance, bsuReturn, taxDeduction, yearsToGoal])

  const askComparison = useMemo(() => {
    const grossAsk = projectMonthlyInvestment(
      initialInvestment,
      monthlySavings,
      expectedReturn,
      comparisonYears
    )
    const askAfterTax =
      initialInvestment +
      monthlySavings * comparisonYears * 12 +
      Math.max(0, grossAsk - initialInvestment - monthlySavings * comparisonYears * 12) *
        (1 - ASK_TAX_RATE)

    const taxableNetReturn = expectedReturn * (1 - ASK_TAX_RATE)
    const taxableAfterTax = projectMonthlyInvestment(
      initialInvestment,
      monthlySavings,
      taxableNetReturn,
      comparisonYears
    )

    return {
      askAfterTax,
      taxableAfterTax,
      advantage: askAfterTax - taxableAfterTax,
    }
  }, [comparisonYears, expectedReturn, initialInvestment, monthlySavings])

  function applyBudgetThread() {
    if (!budgetThread) {
      return
    }

    setMonthlySavings(Math.round(budgetThread.availableToInvest))

    if (bsuEnabled) {
      setAnnualContribution(Math.min(27500, Math.round(budgetThread.availableToBsu * 12)))
    }
  }

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">{bsuEnabled ? 'ASK og BSU-planner' : 'ASK-planner'}</h1>
          <p className="dash-subtitle">
            {bsuEnabled
              ? 'Test egne satser og se hvordan ulike sparevalg slår ut over tid.'
              : 'Test egne satser og se hvordan ASK-sparing slår ut over tid.'}
          </p>
        </div>
      </div>

      {budgetThread ? (
        <div className="dashboard-panel budget-thread-panel">
          <div className="dash-header-row">
            <h2 className="dash-section-title">Fra budsjett til fordeling</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={applyBudgetThread}>
              Bruk budsjettfordeling
            </button>
          </div>
          <div className={`dash-stats ${bsuEnabled ? 'dash-stats-three' : 'dash-stats-two'}`}>
            {bsuEnabled ? (
              <div className="stat-card">
                <span className="stat-label">Til BSU per måned</span>
                <span className="stat-value stat-value-lg">
                  {formatBudgetCurrency(budgetThread.availableToBsu)}
                </span>
                <span className="stat-hint">
                  {budgetThread.bsuAllocationPct.toFixed(0)} % av overskuddet, opptil{' '}
                  {formatBudgetCurrency(budgetThread.availableToBsu * 12)} i året.
                </span>
              </div>
            ) : null}
            <div className="stat-card">
              <span className="stat-label">Til buffer per måned</span>
              <span className="stat-value stat-value-lg">
                {formatBudgetCurrency(budgetThread.availableToBuffer)}
              </span>
              <span className="stat-hint">
                {budgetThread.bufferAllocationPct.toFixed(0)} % holdes igjen som trygg reserve.
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Til investering per måned</span>
              <span className="stat-value stat-value-lg">
                {formatBudgetCurrency(budgetThread.availableToInvest)}
              </span>
              <span className="stat-hint">
                {budgetThread.investmentAllocationPct.toFixed(0)} % kan brukes direkte i
                ASK-sammenligningen under.
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="dashboard-grid">
        {bsuEnabled ? (
          <div className="dashboard-panel">
            <h2 className="dash-section-title">BSU-plan</h2>
            <div className="dashboard-form">
              <label>
                Nåværende BSU-saldo
                <input
                  type="number"
                  value={bsuBalance}
                  onChange={(event) => setBsuBalance(Number(event.target.value))}
                />
              </label>
              <div className="dashboard-form-row">
                <label>
                  Årlig innskudd
                  <input
                    type="number"
                    value={annualContribution}
                    onChange={(event) => setAnnualContribution(Number(event.target.value))}
                  />
                </label>
                <label>
                  Årlig avkastning
                  <input
                    type="number"
                    step="0.1"
                    value={bsuReturn}
                    onChange={(event) => setBsuReturn(Number(event.target.value))}
                  />
                </label>
              </div>
              <div className="dashboard-form-row">
                <label>
                  År til mål
                  <input
                    type="number"
                    min="1"
                    value={yearsToGoal}
                    onChange={(event) => setYearsToGoal(Number(event.target.value))}
                  />
                </label>
                <label>
                  Skattefordel
                  <input
                    type="number"
                    step="0.1"
                    value={taxDeduction}
                    onChange={(event) => setTaxDeduction(Number(event.target.value))}
                  />
                </label>
              </div>
            </div>
            <div className="insight-list">
              <div className="insight-card">
                <span className="stat-label">Estimert BSU-verdi</span>
                <strong>{formatCurrency(bsuProjection.projectedBalance)}</strong>
              </div>
              <div className="insight-card">
                <span className="stat-label">Planlagte innskudd</span>
                <strong>{formatCurrency(bsuProjection.totalContributions)}</strong>
              </div>
              <div className="insight-card">
                <span className="stat-label">Estimert skattefordel</span>
                <strong>{formatCurrency(bsuProjection.estimatedDeduction)}</strong>
              </div>
            </div>
          </div>
        ) : null}

        <div className="dashboard-panel">
          <h2 className="dash-section-title">ASK mot skattepliktig konto</h2>
          <div className="dashboard-form">
            <label>
              Startbeløp
              <input
                type="number"
                value={initialInvestment}
                onChange={(event) => setInitialInvestment(Number(event.target.value))}
              />
            </label>
            <div className="dashboard-form-row">
              <label>
                Månedlig sparing
                <input
                  type="number"
                  value={monthlySavings}
                  onChange={(event) => setMonthlySavings(Number(event.target.value))}
                />
              </label>
              <label>
                Forventet avkastning
                <input
                  type="number"
                  step="0.1"
                  value={expectedReturn}
                  onChange={(event) => setExpectedReturn(Number(event.target.value))}
                />
              </label>
            </div>
            <label>
              Tidshorisont
              <input
                type="number"
                min="1"
                value={comparisonYears}
                onChange={(event) => setComparisonYears(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="insight-list">
            <div className="insight-card">
              <span className="stat-label">ASK etter skatt ved uttak</span>
              <strong>{formatCurrency(askComparison.askAfterTax)}</strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">Skattepliktig konto</span>
              <strong>{formatCurrency(askComparison.taxableAfterTax)}</strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">Forskjell</span>
              <strong
                className={askComparison.advantage >= 0 ? 'metric-positive' : 'metric-negative'}
              >
                {formatCurrency(askComparison.advantage)}
              </strong>
            </div>
          </div>
          <p className="panel-copy">
            Modellen er forenklet og bruker dagens standardsats for gevinstbeskatning i ASK som
            sammenligningsgrunnlag.
          </p>
        </div>
      </div>
    </div>
  )
}
