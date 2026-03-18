export type HoldingAccount = 'ASK' | 'Aksjer/fond' | 'BSU'

export interface PortfolioHolding {
  id: string
  name: string
  ticker: string
  shares: number
  averagePrice: number
  currentPrice: number
  accountType: HoldingAccount
}

export interface DashboardSettings {
  monthlyContribution: number
  expectedReturn: number
  inflation: number
}

export interface PortfolioSummary {
  totalCost: number
  totalValue: number
  totalGain: number
  totalGainPct: number
  projectedValue10y: number
  askShare: number
}

export const PORTFOLIO_STORAGE_KEY = 'ciq-portfolio'
export const SETTINGS_STORAGE_KEY = 'ciq-dashboard-settings'
const DASHBOARD_STORAGE_EVENT = 'ciq-dashboard-storage'

export const defaultDashboardSettings: DashboardSettings = {
  monthlyContribution: 3000,
  expectedReturn: 8,
  inflation: 2.5,
}

export const sampleHoldings: PortfolioHolding[] = [
  {
    id: 'sample-dnb-global',
    name: 'DNB Global Indeks',
    ticker: 'DNBGI',
    shares: 112.4,
    averagePrice: 142.3,
    currentPrice: 168.9,
    accountType: 'ASK',
  },
  {
    id: 'sample-storebrand',
    name: 'Storebrand Norge',
    ticker: 'STBNO',
    shares: 48,
    averagePrice: 215.2,
    currentPrice: 229.6,
    accountType: 'Aksjer/fond',
  },
  {
    id: 'sample-bsu',
    name: 'BSU-konto',
    ticker: 'BSU',
    shares: 1,
    averagePrice: 94500,
    currentPrice: 98750,
    accountType: 'BSU',
  },
]

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function hasWindow() {
  return typeof window !== 'undefined'
}

function emitStorageChange() {
  if (!hasWindow()) {
    return
  }

  window.dispatchEvent(new Event(DASHBOARD_STORAGE_EVENT))
}

export function loadPortfolioHoldings() {
  if (!hasWindow()) {
    return sampleHoldings
  }

  const parsed = parseJson<PortfolioHolding[]>(
    window.localStorage.getItem(PORTFOLIO_STORAGE_KEY),
    sampleHoldings
  )

  return parsed.filter((holding) => Boolean(holding.id && holding.name))
}

export function savePortfolioHoldings(holdings: PortfolioHolding[]) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(holdings))
  emitStorageChange()
}

export function loadDashboardSettings() {
  if (!hasWindow()) {
    return defaultDashboardSettings
  }

  return {
    ...defaultDashboardSettings,
    ...parseJson<Partial<DashboardSettings>>(
      window.localStorage.getItem(SETTINGS_STORAGE_KEY),
      defaultDashboardSettings
    ),
  }
}

export function saveDashboardSettings(settings: DashboardSettings) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  emitStorageChange()
}

export function subscribeDashboardStorage(onStoreChange: () => void) {
  if (!hasWindow()) {
    return () => {}
  }

  const handleStorage = () => onStoreChange()
  window.addEventListener(DASHBOARD_STORAGE_EVENT, handleStorage)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(DASHBOARD_STORAGE_EVENT, handleStorage)
    window.removeEventListener('storage', handleStorage)
  }
}

export function calculatePortfolioSummary(
  holdings: PortfolioHolding[],
  settings: DashboardSettings
): PortfolioSummary {
  const totals = holdings.reduce(
    (acc, holding) => {
      const positionCost = holding.shares * holding.averagePrice
      const positionValue = holding.shares * holding.currentPrice

      acc.totalCost += positionCost
      acc.totalValue += positionValue

      if (holding.accountType === 'ASK') {
        acc.askValue += positionValue
      }

      return acc
    },
    { totalCost: 0, totalValue: 0, askValue: 0 }
  )

  const totalGain = totals.totalValue - totals.totalCost
  const totalGainPct = totals.totalCost > 0 ? (totalGain / totals.totalCost) * 100 : 0
  const askShare = totals.totalValue > 0 ? (totals.askValue / totals.totalValue) * 100 : 0
  const projectedValue10y = projectFutureValue(
    totals.totalValue,
    settings.monthlyContribution,
    settings.expectedReturn,
    10
  )

  return {
    totalCost: totals.totalCost,
    totalValue: totals.totalValue,
    totalGain,
    totalGainPct,
    projectedValue10y,
    askShare,
  }
}

export function projectFutureValue(
  principal: number,
  monthlyContribution: number,
  expectedReturn: number,
  years: number
) {
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1
  const months = years * 12

  let balance = principal
  for (let month = 0; month < months; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
  }

  return balance
}

export function formatCurrency(value: number) {
  return value.toLocaleString('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  })
}

export function formatPercent(value: number) {
  return `${value.toFixed(1).replace('.', ',')} %`
}
