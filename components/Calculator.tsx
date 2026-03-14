'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLang } from '@/lib/i18n'

function formatCurrency(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2).replace('.', ',') + ' mrd. kr'
  if (value >= 1e6) return (value / 1e6).toFixed(2).replace('.', ',') + ' mill. kr'
  return value.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' kr'
}

interface CalcResult {
  finalBalance: number
  totalContrib: number
  interestEarned: number
  balanceData: number[]
  contribData: number[]
}

function calculate(
  principal: number,
  monthly: number,
  rate: number,
  years: number,
  compound: number
): CalcResult {
  const r = rate / 100
  const balanceData: number[] = []
  const contribData: number[] = []

  for (let year = 0; year <= years; year++) {
    const lumpSum = principal * Math.pow(1 + r / compound, compound * year)
    const periods = compound * year
    const rPerPeriod = r / compound
    const contribFV =
      monthly > 0 && rPerPeriod > 0
        ? monthly * ((Math.pow(1 + rPerPeriod, periods) - 1) / rPerPeriod)
        : monthly * periods
    balanceData.push(lumpSum + contribFV)
    contribData.push(principal + monthly * 12 * year)
  }

  const finalBalance = balanceData[balanceData.length - 1]
  const totalContrib = principal + monthly * 12 * years
  const interestEarned = Math.max(0, finalBalance - totalContrib)

  return { finalBalance, totalContrib, interestEarned, balanceData, contribData }
}

function drawChart(
  canvas: HTMLCanvasElement,
  balanceData: number[],
  contribData: number[],
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

  const [principal, setPrincipal]   = useState(100000)
  const [monthly, setMonthly]       = useState(3000)
  const [rate, setRate]             = useState(8)
  const [years, setYears]           = useState(20)
  const [compound, setCompound]     = useState(12)
  const [result, setResult]         = useState<CalcResult | null>(null)

  const runCalc = useCallback(() => {
    const r = calculate(principal, monthly, rate, years, compound)
    setResult(r)
  }, [principal, monthly, rate, years, compound])

  // Recalculate when inputs change
  useEffect(() => {
    const timer = setTimeout(runCalc, 120)
    return () => clearTimeout(timer)
  }, [runCalc])

  // Redraw chart when result or language changes
  useEffect(() => {
    if (!result || !canvasRef.current) return
    const yearLabel = t('chart-year-label')
    drawChart(canvasRef.current, result.balanceData, result.contribData, years, yearLabel)
  }, [result, years, t])

  // Resize handler
  useEffect(() => {
    const onResize = () => {
      if (!result || !canvasRef.current) return
      drawChart(canvasRef.current, result.balanceData, result.contribData, years, t('chart-year-label'))
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
                  onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                />
                <span className="input-suffix">{t('years-suffix')}</span>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="compound">{t('calc-freq-label')}</label>
              <select
                id="compound"
                value={compound}
                onChange={(e) => setCompound(parseInt(e.target.value))}
              >
                <option value={12}>{t('freq-monthly')}</option>
                <option value={4}>{t('freq-quarterly')}</option>
                <option value={2}>{t('freq-semi')}</option>
                <option value={1}>{t('freq-annually')}</option>
                <option value={365}>{t('freq-daily')}</option>
              </select>
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
