'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLang } from '@/lib/i18n'

type AccountType = 'ask' | 'vanlig' | 'bank'

const TAX_CAPITAL = 0.3784 // 37.84% on gains/dividends (aksjer/fond, 2024)
const TAX_BANK    = 0.22   // 22% on bank interest

function formatCurrency(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2).replace('.', ',') + ' mrd. kr'
  if (value >= 1e6) return (value / 1e6).toFixed(2).replace('.', ',') + ' mill. kr'
  return value.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' kr'
}

function formatMultiplier(value: number): string {
  return value.toLocaleString('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '×'
}

// "2025M12" -> "des. 2025"
function formatSsbPeriod(code: string): string {
  const mo: Record<string, string> = {
    M01: 'jan', M02: 'feb', M03: 'mar', M04: 'apr', M05: 'mai', M06: 'jun',
    M07: 'jul', M08: 'aug', M09: 'sep', M10: 'okt', M11: 'nov', M12: 'des',
  }
  const year = code.slice(0, 4)
  const m = code.slice(4)
  return `${mo[m] ?? m}. ${year}`
}

interface YearlyRow {
  year: number
  balance: number
  contributions: number
  totalReturn: number
  realValue: number
}

interface CalcResult {
  finalBalance: number      // after-tax (ASK: after withdrawal tax; others: after effective rate tax)
  preTaxBalance: number     // pre-tax (only differs from finalBalance for ASK)
  realFinalBalance: number  // finalBalance deflated by cumulative inflation
  totalContrib: number
  interestEarned: number    // finalBalance - totalContrib
  multiplier: number        // finalBalance / totalContrib
  safeWithdrawalAnnual: number
  safeWithdrawalMonthly: number
  balanceData: number[]     // year-by-year balance (pre-tax growth for ASK)
  contribData: number[]
  realBalanceData: number[]
  yearlyRows: YearlyRow[]
}

/**
 * Simulates month-by-month growth with tax-aware rates.
 *
 * ASK: Compounds at full rate. At withdrawal, 37.84% tax on net gain.
 *      (Skjermingsfradrag not modelled — conservative estimate.)
 *
 * Vanlig konto: Effective rate = rate × (1 − 37.84%).
 *               Models dividend/gains tax drag (simplified annual deduction).
 *
 * Bankkonto: Effective rate = rate × (1 − 22%).
 *            Interest taxed annually.
 */
function calculate(
  principal: number,
  monthly: number,
  rate: number,
  years: number,
  inflation: number,
  contribGrowth: number,
  accountType: AccountType
): CalcResult {
  const effectiveRate =
    accountType === 'bank'   ? rate * (1 - TAX_BANK) :
    accountType === 'vanlig' ? rate * (1 - TAX_CAPITAL) :
                               rate // ASK: no annual tax

  const rMonthly = Math.pow(1 + effectiveRate / 100, 1 / 12) - 1

  const balanceData: number[]     = []
  const contribData: number[]     = []
  const realBalanceData: number[] = []
  const yearlyRows: YearlyRow[]   = []

  let balance    = principal
  let totalContrib = principal

  balanceData.push(balance)
  contribData.push(totalContrib)
  realBalanceData.push(balance)

  for (let year = 1; year <= years; year++) {
    const monthlyThisYear = monthly * Math.pow(1 + contribGrowth / 100, year - 1)
    for (let m = 0; m < 12; m++) {
      balance      = balance * (1 + rMonthly) + monthlyThisYear
      totalContrib += monthlyThisYear
    }
    const realBalance = balance / Math.pow(1 + inflation / 100, year)
    balanceData.push(balance)
    contribData.push(totalContrib)
    realBalanceData.push(realBalance)
    yearlyRows.push({
      year,
      balance,
      contributions: totalContrib,
      totalReturn: balance - totalContrib,
      realValue: realBalance,
    })
  }

  const preTaxBalance = balance
  const finalBalance  =
    accountType === 'ask'
      ? totalContrib + Math.max(0, preTaxBalance - totalContrib) * (1 - TAX_CAPITAL)
      : balance

  const realFinalBalance     = finalBalance / Math.pow(1 + inflation / 100, years)
  const interestEarned       = Math.max(0, finalBalance - totalContrib)
  const multiplier           = totalContrib > 0 ? finalBalance / totalContrib : 1
  const safeWithdrawalAnnual  = finalBalance * 0.04
  const safeWithdrawalMonthly = safeWithdrawalAnnual / 12

  return {
    finalBalance, preTaxBalance, realFinalBalance,
    totalContrib, interestEarned, multiplier,
    safeWithdrawalAnnual, safeWithdrawalMonthly,
    balanceData, contribData, realBalanceData, yearlyRows,
  }
}

function drawChart(
  canvas: HTMLCanvasElement,
  balanceData: number[],
  contribData: number[],
  realBalanceData: number[],
  years: number,
  yearLabel: string
) {
  const container = canvas.parentElement
  if (!container) return

  const dpr    = window.devicePixelRatio || 1
  const width  = container.clientWidth  || 500
  const height = container.clientHeight || 220

  canvas.width        = width  * dpr
  canvas.height       = height * dpr
  canvas.style.width  = width  + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  const padL = 20, padR = 20, padT = 16, padB = 32
  const chartW = width  - padL - padR
  const chartH = height - padT - padB
  const maxVal = Math.max(...balanceData, 1)
  const points = balanceData.length

  const toX = (i: number) => padL + (i / (points - 1)) * chartW
  const toY = (v: number) => padT + (1 - v / maxVal) * chartH

  ctx.clearRect(0, 0, width, height)

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth   = 1
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * chartH
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke()
  }

  // Contribution fill
  const gradContrib = ctx.createLinearGradient(0, padT, 0, padT + chartH)
  gradContrib.addColorStop(0, 'rgba(16,185,129,0.25)')
  gradContrib.addColorStop(1, 'rgba(16,185,129,0.0)')
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(contribData[0]))
  for (let i = 1; i < points; i++) ctx.lineTo(toX(i), toY(contribData[i]))
  ctx.lineTo(toX(points - 1), padT + chartH)
  ctx.lineTo(toX(0), padT + chartH)
  ctx.closePath()
  ctx.fillStyle = gradContrib
  ctx.fill()

  // Balance fill
  const gradBalance = ctx.createLinearGradient(0, padT, 0, padT + chartH)
  gradBalance.addColorStop(0, 'rgba(99,102,241,0.35)')
  gradBalance.addColorStop(1, 'rgba(99,102,241,0.0)')
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(balanceData[0]))
  for (let i = 1; i < points; i++) {
    const px = toX(i - 1), cx = toX(i), mx = (px + cx) / 2
    ctx.bezierCurveTo(mx, toY(balanceData[i - 1]), mx, toY(balanceData[i]), cx, toY(balanceData[i]))
  }
  ctx.lineTo(toX(points - 1), padT + chartH)
  ctx.lineTo(toX(0), padT + chartH)
  ctx.closePath()
  ctx.fillStyle = gradBalance
  ctx.fill()

  // Contribution line
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(contribData[0]))
  for (let i = 1; i < points; i++) ctx.lineTo(toX(i), toY(contribData[i]))
  ctx.strokeStyle = 'rgba(16,185,129,0.8)'
  ctx.lineWidth   = 2
  ctx.stroke()

  // Real balance line (dashed amber)
  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(realBalanceData[0]))
  for (let i = 1; i < points; i++) {
    const px = toX(i - 1), cx = toX(i), mx = (px + cx) / 2
    ctx.bezierCurveTo(mx, toY(realBalanceData[i - 1]), mx, toY(realBalanceData[i]), cx, toY(realBalanceData[i]))
  }
  ctx.strokeStyle = 'rgba(251,191,36,0.7)'
  ctx.lineWidth   = 1.5
  ctx.stroke()
  ctx.setLineDash([])

  // Balance line
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(balanceData[0]))
  for (let i = 1; i < points; i++) {
    const px = toX(i - 1), cx = toX(i), mx = (px + cx) / 2
    ctx.bezierCurveTo(mx, toY(balanceData[i - 1]), mx, toY(balanceData[i]), cx, toY(balanceData[i]))
  }
  ctx.strokeStyle = 'rgba(129,140,248,0.9)'
  ctx.lineWidth   = 2.5
  ctx.stroke()

  // X-axis labels
  ctx.fillStyle = 'rgba(148,163,184,0.7)'
  ctx.font      = '11px Inter, sans-serif'
  ctx.textAlign = 'center'
  const labelCount = Math.min(years, 6)
  const step       = Math.floor(years / labelCount)
  for (let i = 0; i <= years; i += step || 1) {
    if (i > years) break
    const idx = Math.round((i / years) * (points - 1))
    ctx.fillText(yearLabel + ' ' + i, toX(idx), height - 6)
  }
  ctx.fillText(yearLabel + ' ' + years, toX(points - 1), height - 6)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Calculator() {
  const { t } = useLang()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Inputs
  const [principal,    setPrincipal]    = useState(100000)
  const [monthly,      setMonthly]      = useState(3000)
  const [rate,         setRate]         = useState(8)
  const [years,        setYears]        = useState(20)
  const [inflation,    setInflation]    = useState(2.5)
  const [contribGrowth, setContribGrowth] = useState(0)
  const [accountType,  setAccountType]  = useState<AccountType>('ask')

  // State
  const [result,    setResult]    = useState<CalcResult | null>(null)
  const [showTable, setShowTable] = useState(false)
  const [norskKpi,  setNorskKpi]  = useState<{ rate: number; period: string } | null>(null)

  // Fetch Norwegian CPI from SSB on mount
  useEffect(() => {
    fetch('/api/inflation')
      .then(r => r.json())
      .then(d => {
        if (typeof d.rate === 'number') {
          setNorskKpi({ rate: d.rate, period: d.period ?? '' })
        }
      })
      .catch(() => {}) // silent fail — calculator still works without it
  }, [])

  const runCalc = useCallback(() => {
    setResult(calculate(principal, monthly, rate, years, inflation, contribGrowth, accountType))
  }, [principal, monthly, rate, years, inflation, contribGrowth, accountType])

  useEffect(() => {
    const timer = setTimeout(runCalc, 120)
    return () => clearTimeout(timer)
  }, [runCalc])

  useEffect(() => {
    if (!result || !canvasRef.current) return
    drawChart(canvasRef.current, result.balanceData, result.contribData, result.realBalanceData, years, t('chart-year-label'))
  }, [result, years, t])

  useEffect(() => {
    const onResize = () => {
      if (!result || !canvasRef.current) return
      drawChart(canvasRef.current, result.balanceData, result.contribData, result.realBalanceData, years, t('chart-year-label'))
    }
    const id: { t?: ReturnType<typeof setTimeout> } = {}
    const debounced = () => { clearTimeout(id.t); id.t = setTimeout(onResize, 200) }
    window.addEventListener('resize', debounced, { passive: true })
    return () => window.removeEventListener('resize', debounced)
  }, [result, years, t])

  const taxNoteKey =
    accountType === 'ask'    ? 'calc-tax-note-ask' :
    accountType === 'vanlig' ? 'calc-tax-note-vanlig' :
                               'calc-tax-note-bank'

  const ACCOUNT_TYPES: { key: AccountType; labelKey: string }[] = [
    { key: 'ask',    labelKey: 'calc-account-ask' },
    { key: 'vanlig', labelKey: 'calc-account-vanlig' },
    { key: 'bank',   labelKey: 'calc-account-bank' },
  ]

  return (
    <section className="calculator-section section" id="calculator">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">{t('calc-tag')}</p>
          <h2 className="section-title">{t('calc-title')}</h2>
          <p className="section-subtitle">{t('calc-subtitle')}</p>
        </div>

        <div className="calculator-card">
          {/* ── Inputs ── */}
          <div className="calc-inputs">
            {/* Account type selector */}
            <div className="input-group">
              <label>{t('calc-account-label')}</label>
              <div className="account-selector">
                {ACCOUNT_TYPES.map(({ key, labelKey }) => (
                  <button
                    key={key}
                    className={`account-btn${accountType === key ? ' active' : ''}`}
                    onClick={() => setAccountType(key)}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
              <p className="tax-note">{t(taxNoteKey)}</p>
            </div>

            <div className="input-group">
              <label htmlFor="principal">{t('calc-principal-label')}</label>
              <div className="input-wrapper">
                <input
                  type="number" id="principal" min={0}
                  value={principal}
                  onChange={e => setPrincipal(parseFloat(e.target.value) || 0)}
                />
                <span className="input-suffix">kr</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="monthlyContrib">{t('calc-monthly-label')}</label>
              <div className="input-wrapper">
                <input
                  type="number" id="monthlyContrib" min={0}
                  value={monthly}
                  onChange={e => setMonthly(parseFloat(e.target.value) || 0)}
                />
                <span className="input-suffix">kr</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="rate">{t('calc-rate-label')}</label>
              <div className="input-wrapper">
                <input
                  type="number" id="rate" min={0} max={100} step={0.1}
                  value={rate}
                  onChange={e => setRate(parseFloat(e.target.value) || 0)}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="years">{t('calc-years-label')}</label>
              <div className="input-wrapper">
                <input
                  type="number" id="years" min={1} max={50}
                  value={years}
                  onChange={e => setYears(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                />
                <span className="input-suffix">{t('years-suffix')}</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="inflation">
                {t('calc-inflation-label')}
                {norskKpi && (
                  <button
                    className="kpi-btn"
                    onClick={() => setInflation(norskKpi.rate)}
                    title={`SSB KPI, ${formatSsbPeriod(norskKpi.period)}`}
                  >
                    SSB: {norskKpi.rate.toFixed(1).replace('.', ',')} %
                  </button>
                )}
              </label>
              <div className="input-wrapper">
                <input
                  type="number" id="inflation" min={0} max={20} step={0.1}
                  value={inflation}
                  onChange={e => setInflation(parseFloat(e.target.value) || 0)}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="contribGrowth">{t('calc-contrib-growth-label')}</label>
              <div className="input-wrapper">
                <input
                  type="number" id="contribGrowth" min={0} max={20} step={0.5}
                  value={contribGrowth}
                  onChange={e => setContribGrowth(parseFloat(e.target.value) || 0)}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>

          {/* ── Results ── */}
          <div className="calc-results">
            <div className="result-summary">

              {/* Main stat */}
              <div className="result-item result-item-main">
                <span className="result-label">
                  {accountType === 'ask' ? t('calc-pretax-label') : t('calc-final-label')}
                </span>
                <span className="result-value">
                  {result ? formatCurrency(accountType === 'ask' ? result.preTaxBalance : result.finalBalance) : '0 kr'}
                </span>
              </div>

              {/* Row 1: after-tax (ASK) or real value + multiplier (others) */}
              {accountType === 'ask' ? (
                <div className="result-row">
                  <div className="result-item">
                    <span className="result-label">{t('calc-aftertax-label')}</span>
                    <span className="result-value result-value-sm result-value-green">
                      {result ? formatCurrency(result.finalBalance) : '0 kr'}
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">{t('calc-real-label')}</span>
                    <span className="result-value result-value-sm result-value-amber">
                      {result ? formatCurrency(result.realFinalBalance) : '0 kr'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="result-row">
                  <div className="result-item">
                    <span className="result-label">{t('calc-real-label')}</span>
                    <span className="result-value result-value-sm result-value-amber">
                      {result ? formatCurrency(result.realFinalBalance) : '0 kr'}
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">{t('calc-multiplier-label')}</span>
                    <span className="result-value result-value-sm result-value-green">
                      {result ? formatMultiplier(result.multiplier) : '0×'}
                    </span>
                  </div>
                </div>
              )}

              {/* Row 2: contributions + return */}
              <div className="result-row">
                <div className="result-item">
                  <span className="result-label">{t('calc-contrib-label')}</span>
                  <span className="result-value result-value-sm">
                    {result ? formatCurrency(result.totalContrib) : '0 kr'}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calc-interest-label')}</span>
                  <span className="result-value result-value-sm result-value-green">
                    {result ? formatCurrency(result.interestEarned) : '0 kr'}
                  </span>
                </div>
              </div>

              {/* Row 3: multiplier (ASK only) + safe withdrawal */}
              <div className="result-row">
                {accountType === 'ask' && (
                  <div className="result-item">
                    <span className="result-label">{t('calc-multiplier-label')}</span>
                    <span className="result-value result-value-sm result-value-green">
                      {result ? formatMultiplier(result.multiplier) : '0×'}
                    </span>
                  </div>
                )}
                <div className="result-item">
                  <span className="result-label">{t('calc-withdrawal-label')}</span>
                  <span className="result-value result-value-sm">
                    {result ? formatCurrency(result.safeWithdrawalAnnual) : '0 kr'}
                  </span>
                  <span className="result-value-sub">
                    {result ? formatCurrency(result.safeWithdrawalMonthly) : '0 kr'} {t('calc-per-month')}
                  </span>
                </div>
              </div>

            </div>

            {/* Chart */}
            <div className="chart-container">
              <canvas ref={canvasRef} id="growthChart" />
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot legend-dot-blue" />
                <span>{t('calc-legend-balance')}</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot legend-dot-amber" />
                <span>{t('calc-legend-real')}</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot legend-dot-green" />
                <span>{t('calc-legend-contrib')}</span>
              </span>
            </div>

            {/* Yearly breakdown table */}
            <div>
              <button
                className="calc-table-toggle"
                onClick={() => setShowTable(s => !s)}
              >
                {showTable ? t('calc-hide-table') : t('calc-show-table')}
              </button>
              {showTable && result && (
                <div className="calc-table-wrapper">
                  <table className="calc-table">
                    <thead>
                      <tr>
                        <th>{t('calc-table-year')}</th>
                        <th>{t('calc-table-balance')}</th>
                        <th>{t('calc-table-contrib')}</th>
                        <th>{t('calc-table-return')}</th>
                        <th>{t('calc-table-real')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyRows.map(row => (
                        <tr key={row.year} className={row.year % 5 === 0 ? 'table-row-milestone' : ''}>
                          <td>{row.year}</td>
                          <td>{formatCurrency(row.balance)}</td>
                          <td>{formatCurrency(row.contributions)}</td>
                          <td>{formatCurrency(row.totalReturn)}</td>
                          <td>{formatCurrency(row.realValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>

        {accountType === 'ask' && (
          <p className="calc-disclaimer">{t('calc-ask-note')}</p>
        )}
        {accountType === 'vanlig' && (
          <p className="calc-disclaimer">{t('calc-vanlig-note')}</p>
        )}

      </div>
    </section>
  )
}
