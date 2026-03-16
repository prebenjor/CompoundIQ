'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLang } from '@/lib/i18n'

function formatCurrency(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2).replace('.', ',') + ' mrd. kr'
  if (value >= 1e6) return (value / 1e6).toFixed(2).replace('.', ',') + ' mill. kr'
  return value.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' kr'
}

function formatMultiplier(value: number): string {
  return value.toLocaleString('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '×'
}

interface CalcResult {
  finalBalance: number
  realFinalBalance: number
  totalContrib: number
  interestEarned: number
  multiplier: number
  balanceData: number[]
  contribData: number[]
  realBalanceData: number[]
}

/**
 * Simulates month-by-month growth.
 * - Annual rate is converted to monthly: (1+r)^(1/12) - 1
 * - Monthly contribution grows by contribGrowth% per year
 * - Real value deflated by inflation annually
 */
function calculate(
  principal: number,
  monthly: number,
  rate: number,
  years: number,
  inflation: number,
  contribGrowth: number
): CalcResult {
  const rMonthly = Math.pow(1 + rate / 100, 1 / 12) - 1

  const balanceData: number[] = []
  const contribData: number[] = []
  const realBalanceData: number[] = []

  let balance = principal
  let totalContrib = principal

  balanceData.push(balance)
  contribData.push(totalContrib)
  realBalanceData.push(balance)

  for (let year = 1; year <= years; year++) {
    const monthlyThisYear = monthly * Math.pow(1 + contribGrowth / 100, year - 1)
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + rMonthly) + monthlyThisYear
      totalContrib += monthlyThisYear
    }
    const realBalance = balance / Math.pow(1 + inflation / 100, year)
    balanceData.push(balance)
    contribData.push(totalContrib)
    realBalanceData.push(realBalance)
  }

  const finalBalance = balance
  const realFinalBalance = realBalanceData[realBalanceData.length - 1]
  const interestEarned = Math.max(0, finalBalance - totalContrib)
  const multiplier = totalContrib > 0 ? finalBalance / totalContrib : 1

  return {
    finalBalance,
    realFinalBalance,
    totalContrib,
    interestEarned,
    multiplier,
    balanceData,
    contribData,
    realBalanceData,
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

  const dpr = window.devicePixelRatio || 1
  const width = container.clientWidth || 500
  const height = container.clientHeight || 220

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  const padL = 20, padR = 20, padT = 16, padB = 32
  const chartW = width - padL - padR
  const chartH = height - padT - padB
  const maxVal = Math.max(...balanceData, 1)
  const points = balanceData.length

  const toX = (i: number) => padL + (i / (points - 1)) * chartW
  const toY = (v: number) => padT + (1 - v / maxVal) * chartH

  ctx.clearRect(0, 0, width, height)

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * chartH
    ctx.beginPath()
    ctx.moveTo(padL, y)
    ctx.lineTo(padL + chartW, y)
    ctx.stroke()
  }

  // Contribution area
  const gradContrib = ctx.createLinearGradient(0, padT, 0, padT + chartH)
  gradContrib.addColorStop(0, 'rgba(16, 185, 129, 0.25)')
  gradContrib.addColorStop(1, 'rgba(16, 185, 129, 0.0)')
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(contribData[0]))
  for (let i = 1; i < points; i++) ctx.lineTo(toX(i), toY(contribData[i]))
  ctx.lineTo(toX(points - 1), padT + chartH)
  ctx.lineTo(toX(0), padT + chartH)
  ctx.closePath()
  ctx.fillStyle = gradContrib
  ctx.fill()

  // Balance area
  const gradBalance = ctx.createLinearGradient(0, padT, 0, padT + chartH)
  gradBalance.addColorStop(0, 'rgba(99, 102, 241, 0.35)')
  gradBalance.addColorStop(1, 'rgba(99, 102, 241, 0.0)')
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(balanceData[0]))
  for (let i = 1; i < points; i++) {
    const prevX = toX(i - 1), currX = toX(i), cpX = (prevX + currX) / 2
    ctx.bezierCurveTo(cpX, toY(balanceData[i - 1]), cpX, toY(balanceData[i]), currX, toY(balanceData[i]))
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
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Real balance line (dashed amber)
  ctx.beginPath()
  ctx.setLineDash([5, 4])
  ctx.moveTo(toX(0), toY(realBalanceData[0]))
  for (let i = 1; i < points; i++) {
    const prevX = toX(i - 1), currX = toX(i), cpX = (prevX + currX) / 2
    ctx.bezierCurveTo(cpX, toY(realBalanceData[i - 1]), cpX, toY(realBalanceData[i]), currX, toY(realBalanceData[i]))
  }
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([])

  // Balance line
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(balanceData[0]))
  for (let i = 1; i < points; i++) {
    const prevX = toX(i - 1), currX = toX(i), cpX = (prevX + currX) / 2
    ctx.bezierCurveTo(cpX, toY(balanceData[i - 1]), cpX, toY(balanceData[i]), currX, toY(balanceData[i]))
  }
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.9)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // X-axis labels
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'
  ctx.font = '11px Inter, sans-serif'
  ctx.textAlign = 'center'
  const labelCount = Math.min(years, 6)
  const step = Math.floor(years / labelCount)
  for (let i = 0; i <= years; i += step || 1) {
    if (i > years) break
    const idx = Math.round((i / years) * (points - 1))
    ctx.fillText(yearLabel + ' ' + i, toX(idx), height - 6)
  }
  ctx.fillText(yearLabel + ' ' + years, toX(points - 1), height - 6)
}

export default function Calculator() {
  const { t } = useLang()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [principal, setPrincipal]       = useState(100000)
  const [monthly, setMonthly]           = useState(3000)
  const [rate, setRate]                 = useState(8)
  const [years, setYears]               = useState(20)
  const [inflation, setInflation]       = useState(2.5)
  const [contribGrowth, setContribGrowth] = useState(0)
  const [result, setResult]             = useState<CalcResult | null>(null)

  const runCalc = useCallback(() => {
    const r = calculate(principal, monthly, rate, years, inflation, contribGrowth)
    setResult(r)
  }, [principal, monthly, rate, years, inflation, contribGrowth])

  useEffect(() => {
    const timer = setTimeout(runCalc, 120)
    return () => clearTimeout(timer)
  }, [runCalc])

  useEffect(() => {
    if (!result || !canvasRef.current) return
    const yearLabel = t('chart-year-label')
    drawChart(canvasRef.current, result.balanceData, result.contribData, result.realBalanceData, years, yearLabel)
  }, [result, years, t])

  useEffect(() => {
    const onResize = () => {
      if (!result || !canvasRef.current) return
      drawChart(canvasRef.current, result.balanceData, result.contribData, result.realBalanceData, years, t('chart-year-label'))
    }
    const timer = { id: undefined as ReturnType<typeof setTimeout> | undefined }
    const debounced = () => { if (timer.id) clearTimeout(timer.id); timer.id = setTimeout(onResize, 200) }
    window.addEventListener('resize', debounced, { passive: true })
    return () => window.removeEventListener('resize', debounced)
  }, [result, years, t])

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
            <div className="input-group">
              <label htmlFor="principal">{t('calc-principal-label')}</label>
              <div className="input-wrapper">
                <input
                  type="number" id="principal" min={0}
                  value={principal}
                  onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => setMonthly(parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => setYears(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                />
                <span className="input-suffix">{t('years-suffix')}</span>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="inflation">{t('calc-inflation-label')}</label>
              <div className="input-wrapper">
                <input
                  type="number" id="inflation" min={0} max={20} step={0.1}
                  value={inflation}
                  onChange={(e) => setInflation(parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => setContribGrowth(parseFloat(e.target.value) || 0)}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>

          <div className="calc-results">
            <div className="result-summary">
              <div className="result-item result-item-main">
                <span className="result-label">{t('calc-final-label')}</span>
                <span className="result-value">
                  {result ? formatCurrency(result.finalBalance) : '0 kr'}
                </span>
              </div>
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
            </div>
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
          </div>
        </div>
      </div>
    </section>
  )
}
