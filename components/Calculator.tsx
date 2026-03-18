'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '@/lib/i18n'

type AccountType = 'ask' | 'vanlig' | 'bank'

const TAX_CAPITAL = 0.3784
const TAX_BANK = 0.22

interface YearlyRow {
  year: number
  balance: number
  contributions: number
  totalReturn: number
  realValue: number
}

interface CalcResult {
  finalBalance: number
  preTaxBalance: number
  realFinalBalance: number
  totalContrib: number
  interestEarned: number
  multiplier: number
  safeWithdrawalAnnual: number
  safeWithdrawalMonthly: number
  balanceData: number[]
  contribData: number[]
  realBalanceData: number[]
  yearlyRows: YearlyRow[]
}

function formatCurrency(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2).replace('.', ',')} mrd. kr`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2).replace('.', ',')} mill. kr`
  return `${value.toLocaleString('nb-NO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} kr`
}

function formatMultiplier(value: number) {
  return `${value.toLocaleString('nb-NO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}x`
}

function formatSsbPeriod(code: string) {
  const months: Record<string, string> = {
    M01: 'jan',
    M02: 'feb',
    M03: 'mar',
    M04: 'apr',
    M05: 'mai',
    M06: 'jun',
    M07: 'jul',
    M08: 'aug',
    M09: 'sep',
    M10: 'okt',
    M11: 'nov',
    M12: 'des',
  }

  return `${months[code.slice(4)] ?? code.slice(4)}. ${code.slice(0, 4)}`
}

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
    accountType === 'bank'
      ? rate * (1 - TAX_BANK)
      : accountType === 'vanlig'
        ? rate * (1 - TAX_CAPITAL)
        : rate

  const monthlyRate = Math.pow(1 + effectiveRate / 100, 1 / 12) - 1
  const balanceData: number[] = [principal]
  const contribData: number[] = [principal]
  const realBalanceData: number[] = [principal]
  const yearlyRows: YearlyRow[] = []

  let balance = principal
  let totalContrib = principal

  for (let year = 1; year <= years; year += 1) {
    const monthlyThisYear = monthly * Math.pow(1 + contribGrowth / 100, year - 1)

    for (let month = 0; month < 12; month += 1) {
      balance = balance * (1 + monthlyRate) + monthlyThisYear
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
  const finalBalance =
    accountType === 'ask'
      ? totalContrib + Math.max(0, preTaxBalance - totalContrib) * (1 - TAX_CAPITAL)
      : preTaxBalance

  const realFinalBalance = finalBalance / Math.pow(1 + inflation / 100, years)
  const interestEarned = Math.max(0, finalBalance - totalContrib)
  const multiplier = totalContrib > 0 ? finalBalance / totalContrib : 1
  const safeWithdrawalAnnual = finalBalance * 0.04
  const safeWithdrawalMonthly = safeWithdrawalAnnual / 12

  return {
    finalBalance,
    preTaxBalance,
    realFinalBalance,
    totalContrib,
    interestEarned,
    multiplier,
    safeWithdrawalAnnual,
    safeWithdrawalMonthly,
    balanceData,
    contribData,
    realBalanceData,
    yearlyRows,
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
  if (!container) {
    return
  }

  const dpr = window.devicePixelRatio || 1
  const width = container.clientWidth || 500
  const height = container.clientHeight || 220

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  ctx.scale(dpr, dpr)

  const padL = 20
  const padR = 20
  const padT = 16
  const padB = 32
  const chartW = width - padL - padR
  const chartH = height - padT - padB
  const maxVal = Math.max(...balanceData, 1)
  const points = balanceData.length

  const toX = (i: number) => padL + (i / (points - 1)) * chartW
  const toY = (value: number) => padT + (1 - value / maxVal) * chartH

  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1

  for (let i = 0; i <= 4; i += 1) {
    const y = padT + (i / 4) * chartH
    ctx.beginPath()
    ctx.moveTo(padL, y)
    ctx.lineTo(padL + chartW, y)
    ctx.stroke()
  }

  const contribGradient = ctx.createLinearGradient(0, padT, 0, padT + chartH)
  contribGradient.addColorStop(0, 'rgba(16,185,129,0.25)')
  contribGradient.addColorStop(1, 'rgba(16,185,129,0)')
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(contribData[0]))
  for (let i = 1; i < points; i += 1) ctx.lineTo(toX(i), toY(contribData[i]))
  ctx.lineTo(toX(points - 1), padT + chartH)
  ctx.lineTo(toX(0), padT + chartH)
  ctx.closePath()
  ctx.fillStyle = contribGradient
  ctx.fill()

  const balanceGradient = ctx.createLinearGradient(0, padT, 0, padT + chartH)
  balanceGradient.addColorStop(0, 'rgba(99,102,241,0.35)')
  balanceGradient.addColorStop(1, 'rgba(99,102,241,0)')
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(balanceData[0]))
  for (let i = 1; i < points; i += 1) {
    const px = toX(i - 1)
    const cx = toX(i)
    const mx = (px + cx) / 2
    ctx.bezierCurveTo(mx, toY(balanceData[i - 1]), mx, toY(balanceData[i]), cx, toY(balanceData[i]))
  }
  ctx.lineTo(toX(points - 1), padT + chartH)
  ctx.lineTo(toX(0), padT + chartH)
  ctx.closePath()
  ctx.fillStyle = balanceGradient
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(toX(0), toY(contribData[0]))
  for (let i = 1; i < points; i += 1) ctx.lineTo(toX(i), toY(contribData[i]))
  ctx.strokeStyle = 'rgba(16,185,129,0.8)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(realBalanceData[0]))
  for (let i = 1; i < points; i += 1) {
    const px = toX(i - 1)
    const cx = toX(i)
    const mx = (px + cx) / 2
    ctx.bezierCurveTo(mx, toY(realBalanceData[i - 1]), mx, toY(realBalanceData[i]), cx, toY(realBalanceData[i]))
  }
  ctx.strokeStyle = 'rgba(251,191,36,0.7)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([])

  ctx.beginPath()
  ctx.moveTo(toX(0), toY(balanceData[0]))
  for (let i = 1; i < points; i += 1) {
    const px = toX(i - 1)
    const cx = toX(i)
    const mx = (px + cx) / 2
    ctx.bezierCurveTo(mx, toY(balanceData[i - 1]), mx, toY(balanceData[i]), cx, toY(balanceData[i]))
  }
  ctx.strokeStyle = 'rgba(129,140,248,0.9)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.fillStyle = 'rgba(148,163,184,0.7)'
  ctx.font = '11px Inter, sans-serif'
  ctx.textAlign = 'center'

  const labelCount = Math.min(years, 6)
  const step = Math.max(1, Math.floor(years / labelCount))
  for (let i = 0; i <= years; i += step) {
    const index = Math.round((i / years) * (points - 1))
    ctx.fillText(`${yearLabel} ${i}`, toX(index), height - 6)
  }
}

export default function Calculator() {
  const { t } = useLang()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [principal, setPrincipal] = useState(100000)
  const [monthly, setMonthly] = useState(3000)
  const [rate, setRate] = useState(8)
  const [years, setYears] = useState(20)
  const [inflation, setInflation] = useState(2.5)
  const [contribGrowth, setContribGrowth] = useState(0)
  const [accountType, setAccountType] = useState<AccountType>('ask')
  const [result, setResult] = useState<CalcResult | null>(null)
  const [showTable, setShowTable] = useState(false)
  const [norskKpi, setNorskKpi] = useState<{ rate: number; period: string } | null>(null)

  useEffect(() => {
    fetch('/api/inflation')
      .then((response) => response.json())
      .then((data) => {
        if (typeof data.rate === 'number') {
          setNorskKpi({ rate: data.rate, period: data.period ?? '' })
        }
      })
      .catch(() => {})
  }, [])

  const runCalc = useCallback(() => {
    setResult(
      calculate(principal, monthly, rate, years, inflation, contribGrowth, accountType)
    )
  }, [accountType, contribGrowth, inflation, monthly, principal, rate, years])

  useEffect(() => {
    const timeout = setTimeout(runCalc, 80)
    return () => clearTimeout(timeout)
  }, [runCalc])

  useEffect(() => {
    if (!result || !canvasRef.current) {
      return
    }

    drawChart(
      canvasRef.current,
      result.balanceData,
      result.contribData,
      result.realBalanceData,
      years,
      t('chart-year-label')
    )
  }, [result, t, years])

  useEffect(() => {
    const onResize = () => {
      if (!result || !canvasRef.current) {
        return
      }

      drawChart(
        canvasRef.current,
        result.balanceData,
        result.contribData,
        result.realBalanceData,
        years,
        t('chart-year-label')
      )
    }

    const debounced = () => setTimeout(onResize, 100)
    window.addEventListener('resize', debounced, { passive: true })
    return () => window.removeEventListener('resize', debounced)
  }, [result, t, years])

  const taxNoteKey =
    accountType === 'ask'
      ? 'calc-tax-note-ask'
      : accountType === 'vanlig'
        ? 'calc-tax-note-vanlig'
        : 'calc-tax-note-bank'

  const stats = result
    ? [
        accountType === 'ask'
          ? { label: t('calc-pretax-label'), value: formatCurrency(result.preTaxBalance), color: '' }
          : { label: t('calc-contrib-label'), value: formatCurrency(result.totalContrib), color: '' },
        accountType === 'ask'
          ? { label: t('calc-aftertax-label'), value: formatCurrency(result.finalBalance), color: 'green' }
          : { label: t('calc-interest-label'), value: formatCurrency(result.interestEarned), color: 'green' },
        { label: t('calc-real-label'), value: formatCurrency(result.realFinalBalance), color: 'amber' },
        {
          label: t('calc-withdrawal-label'),
          value: formatCurrency(result.safeWithdrawalAnnual),
          color: '',
          sub: `${formatCurrency(result.safeWithdrawalMonthly)} ${t('calc-per-month')}`,
        },
      ]
    : []

  return (
    <section className="calculator-section section" id="calculator">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">{t('calc-tag')}</p>
          <h2 className="section-title">{t('calc-title')}</h2>
          <p className="section-subtitle">{t('calc-subtitle')}</p>
        </div>

        <div className="calculator-card">
          <div className="calc-inputs">
            <div className="input-group input-group-full">
              <label>{t('calc-account-label')}</label>
              <div className="account-selector">
                {[
                  { key: 'ask', labelKey: 'calc-account-ask' },
                  { key: 'vanlig', labelKey: 'calc-account-vanlig' },
                  { key: 'bank', labelKey: 'calc-account-bank' },
                ].map(({ key, labelKey }) => (
                  <button
                    key={key}
                    type="button"
                    className={`account-btn${accountType === key ? ' active' : ''}`}
                    onClick={() => setAccountType(key as AccountType)}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
              <p className="tax-note">{t(taxNoteKey)}</p>
            </div>

            <InputField
              id="principal"
              label={t('calc-principal-label')}
              value={principal}
              suffix="kr"
              onChange={setPrincipal}
            />
            <InputField
              id="monthly"
              label={t('calc-monthly-label')}
              value={monthly}
              suffix="kr"
              onChange={setMonthly}
            />
            <input
              type="range"
              className="calc-slider"
              min={0}
              max={25000}
              step={500}
              value={monthly}
              onChange={(event) => setMonthly(Number(event.target.value))}
            />

            <InputField
              id="rate"
              label={t('calc-rate-label')}
              value={rate}
              suffix="%"
              step={0.1}
              onChange={setRate}
            />
            <input
              type="range"
              className="calc-slider"
              min={0}
              max={20}
              step={0.5}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
            />

            <InputField
              id="years"
              label={t('calc-years-label')}
              value={years}
              suffix={t('years-suffix')}
              min={1}
              max={50}
              onChange={(value) => setYears(Math.min(50, Math.max(1, value)))}
            />

            <div className="input-group">
              <label htmlFor="inflation">
                {t('calc-inflation-label')}
                {norskKpi ? (
                  <button
                    type="button"
                    className="kpi-btn"
                    onClick={() => setInflation(norskKpi.rate)}
                    title={`SSB KPI, ${formatSsbPeriod(norskKpi.period)}`}
                  >
                    SSB {norskKpi.rate.toFixed(1).replace('.', ',')} %
                  </button>
                ) : null}
              </label>
              <div className="input-wrapper">
                <input
                  id="inflation"
                  type="number"
                  min={0}
                  max={20}
                  step={0.1}
                  value={inflation}
                  onChange={(event) => setInflation(Number(event.target.value))}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>

            <InputField
              id="contribGrowth"
              label={t('calc-contrib-growth-label')}
              value={contribGrowth}
              suffix="%"
              step={0.5}
              onChange={setContribGrowth}
            />
          </div>

          <div className="calc-results">
            <div className="result-hero">
              <div className="result-hero-left">
                <span className="result-label">
                  {accountType === 'ask' ? t('calc-pretax-label') : t('calc-final-label')}
                </span>
                <span className="result-value">
                  {result
                    ? formatCurrency(
                        accountType === 'ask' ? result.preTaxBalance : result.finalBalance
                      )
                    : '-'}
                </span>
                {accountType === 'ask' && result ? (
                  <span className="result-after-tax">
                    {t('calc-aftertax-label')}: <strong>{formatCurrency(result.finalBalance)}</strong>
                  </span>
                ) : null}
              </div>
              <div className="result-hero-right">
                <span className="result-multiplier">
                  {result ? formatMultiplier(result.multiplier) : '-'}
                </span>
                <span className="result-label">{t('calc-multiplier-label')}</span>
              </div>
            </div>

            <div className="chart-container">
              <canvas ref={canvasRef} />
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

            <div className="calc-stats-row">
              {stats.map((stat) => (
                <div key={stat.label} className="calc-stat">
                  <span className="calc-stat-label">{stat.label}</span>
                  <span
                    className={`calc-stat-value${stat.color ? ` result-value-${stat.color}` : ''}`}
                  >
                    {stat.value}
                  </span>
                  {'sub' in stat ? <span className="calc-stat-sub">{stat.sub}</span> : null}
                </div>
              ))}
            </div>

            <div>
              <button
                type="button"
                className="calc-table-toggle"
                onClick={() => setShowTable((current) => !current)}
              >
                {showTable ? t('calc-hide-table') : t('calc-show-table')}
              </button>
              {showTable && result ? (
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
                      {result.yearlyRows.map((row) => (
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
              ) : null}
            </div>
          </div>
        </div>

        {accountType === 'ask' ? <p className="calc-disclaimer">{t('calc-ask-note')}</p> : null}
        {accountType === 'vanlig' ? (
          <p className="calc-disclaimer">{t('calc-vanlig-note')}</p>
        ) : null}
      </div>
    </section>
  )
}

function InputField({
  id,
  label,
  value,
  suffix,
  step = 1,
  min = 0,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  suffix: string
  step?: number
  min?: number
  max?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrapper">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
        />
        <span className="input-suffix">{suffix}</span>
      </div>
    </div>
  )
}
