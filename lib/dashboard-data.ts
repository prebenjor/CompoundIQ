import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import type { Lang } from '@/lib/i18n'

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
  bsuEnabled: boolean
  bufferAllocationPct: number
  bsuAllocationPct: number
  investmentAllocationPct: number
}

export interface AccountPreferences {
  weeklyDigest: boolean
  taxReminders: boolean
  productUpdates: boolean
  securityAlerts: boolean
  compactNumbers: boolean
}

export interface PortfolioSummary {
  totalCost: number
  totalValue: number
  totalGain: number
  totalGainPct: number
  projectedValue10y: number
  askShare: number
}

interface UserSettingsRow {
  user_id: string
  monthly_contribution: number
  expected_return: number
  inflation: number
  bsu_enabled: boolean
  buffer_allocation_pct: number
  bsu_allocation_pct: number
  investment_allocation_pct: number
  weekly_digest: boolean
  tax_reminders: boolean
  product_updates: boolean
  security_alerts: boolean
  compact_numbers: boolean
}

interface ProfileRow {
  id?: string
  plan?: 'free' | 'pro' | 'teams' | null
  language?: Lang | null
}

export const defaultDashboardSettings: DashboardSettings = {
  monthlyContribution: 3000,
  expectedReturn: 8,
  inflation: 2.5,
  bsuEnabled: true,
  bufferAllocationPct: 20,
  bsuAllocationPct: 30,
  investmentAllocationPct: 50,
}

export const defaultAccountPreferences: AccountPreferences = {
  weeklyDigest: true,
  taxReminders: true,
  productUpdates: false,
  securityAlerts: true,
  compactNumbers: false,
}

export const sampleHoldings: Omit<PortfolioHolding, 'id'>[] = [
  {
    name: 'DNB Global Indeks',
    ticker: 'DNBGI',
    shares: 112.4,
    averagePrice: 142.3,
    currentPrice: 168.9,
    accountType: 'ASK',
  },
  {
    name: 'Storebrand Norge',
    ticker: 'STBNO',
    shares: 48,
    averagePrice: 215.2,
    currentPrice: 229.6,
    accountType: 'Aksjer/fond',
  },
  {
    name: 'BSU-konto',
    ticker: 'BSU',
    shares: 1,
    averagePrice: 94500,
    currentPrice: 98750,
    accountType: 'BSU',
  },
]

function mapSettingsRow(row?: Partial<UserSettingsRow> | null): DashboardSettings {
  return {
    monthlyContribution:
      row?.monthly_contribution ?? defaultDashboardSettings.monthlyContribution,
    expectedReturn: row?.expected_return ?? defaultDashboardSettings.expectedReturn,
    inflation: row?.inflation ?? defaultDashboardSettings.inflation,
    bsuEnabled: row?.bsu_enabled ?? defaultDashboardSettings.bsuEnabled,
    bufferAllocationPct:
      row?.buffer_allocation_pct ?? defaultDashboardSettings.bufferAllocationPct,
    bsuAllocationPct: row?.bsu_allocation_pct ?? defaultDashboardSettings.bsuAllocationPct,
    investmentAllocationPct:
      row?.investment_allocation_pct ?? defaultDashboardSettings.investmentAllocationPct,
  }
}

function mapPreferencesRow(row?: Partial<UserSettingsRow> | null): AccountPreferences {
  return {
    weeklyDigest: row?.weekly_digest ?? defaultAccountPreferences.weeklyDigest,
    taxReminders: row?.tax_reminders ?? defaultAccountPreferences.taxReminders,
    productUpdates: row?.product_updates ?? defaultAccountPreferences.productUpdates,
    securityAlerts: row?.security_alerts ?? defaultAccountPreferences.securityAlerts,
    compactNumbers: row?.compact_numbers ?? defaultAccountPreferences.compactNumbers,
  }
}

function buildUserSettingsRow(
  userId: string,
  settings: DashboardSettings = defaultDashboardSettings,
  preferences: AccountPreferences = defaultAccountPreferences
): UserSettingsRow {
  return {
    user_id: userId,
    monthly_contribution: settings.monthlyContribution,
    expected_return: settings.expectedReturn,
    inflation: settings.inflation,
    bsu_enabled: settings.bsuEnabled,
    buffer_allocation_pct: settings.bufferAllocationPct,
    bsu_allocation_pct: settings.bsuAllocationPct,
    investment_allocation_pct: settings.investmentAllocationPct,
    weekly_digest: preferences.weeklyDigest,
    tax_reminders: preferences.taxReminders,
    product_updates: preferences.productUpdates,
    security_alerts: preferences.securityAlerts,
    compact_numbers: preferences.compactNumbers,
  }
}

function mapHoldingRow(row: Record<string, unknown>): PortfolioHolding {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    ticker: String(row.ticker ?? ''),
    shares: Number(row.shares ?? 0),
    averagePrice: Number(row.average_price ?? 0),
    currentPrice: Number(row.current_price ?? 0),
    accountType: row.account_type as HoldingAccount,
  }
}

async function getAuthenticatedClient() {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('Du må være logget inn for å hente data.')
  }

  return { supabase, user }
}

export async function fetchProfileLanguage() {
  const { supabase, user } = await getAuthenticatedClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('language')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return ((data as ProfileRow | null)?.language ?? 'no') as Lang
}

export async function fetchDashboardSettingsBundle() {
  const { supabase, user } = await getAuthenticatedClient()
  const [settingsResult, profileResult] = await Promise.all([
    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('language').eq('id', user.id).maybeSingle(),
  ])

  if (settingsResult.error) {
    throw settingsResult.error
  }

  if (profileResult.error) {
    throw profileResult.error
  }

  const data = settingsResult.data
  const language = ((profileResult.data as ProfileRow | null)?.language ?? 'no') as Lang

  if (!data) {
    const payload = buildUserSettingsRow(user.id)
    const { data: inserted, error: insertError } = await supabase
      .from('user_settings')
      .upsert(payload)
      .select('*')
      .single()

    if (insertError) {
      throw insertError
    }

    return {
      settings: mapSettingsRow(inserted),
      preferences: mapPreferencesRow(inserted),
      language,
    }
  }

  return {
    settings: mapSettingsRow(data),
    preferences: mapPreferencesRow(data),
    language,
  }
}

export async function saveDashboardSettings(settings: DashboardSettings) {
  const current = await fetchDashboardSettingsBundle()
  const { supabase, user } = await getAuthenticatedClient()
  const payload = buildUserSettingsRow(user.id, settings, current.preferences)

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(payload)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return {
    settings: mapSettingsRow(data),
    preferences: mapPreferencesRow(data),
    language: current.language,
  }
}

export async function saveAccountPreferences(preferences: AccountPreferences) {
  const current = await fetchDashboardSettingsBundle()
  const { supabase, user } = await getAuthenticatedClient()
  const payload = buildUserSettingsRow(user.id, current.settings, preferences)

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(payload)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return {
    settings: mapSettingsRow(data),
    preferences: mapPreferencesRow(data),
    language: current.language,
  }
}

export async function saveProfileLanguage(language: Lang) {
  const { supabase, user } = await getAuthenticatedClient()
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      language,
    })

  if (error) {
    throw error
  }

  return language
}

export async function fetchPortfolioHoldings() {
  const { supabase, user } = await getAuthenticatedClient()
  const { data, error } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => mapHoldingRow(row as Record<string, unknown>))
}

export async function createPortfolioHolding(holding: Omit<PortfolioHolding, 'id'>) {
  const { supabase, user } = await getAuthenticatedClient()
  const payload = {
    user_id: user.id,
    name: holding.name,
    ticker: holding.ticker,
    shares: holding.shares,
    average_price: holding.averagePrice,
    current_price: holding.currentPrice,
    account_type: holding.accountType,
  }

  const { error } = await supabase.from('portfolio_holdings').insert(payload)

  if (error) {
    throw error
  }

  return fetchPortfolioHoldings()
}

export async function deletePortfolioHolding(id: string) {
  const { supabase, user } = await getAuthenticatedClient()
  const { error } = await supabase
    .from('portfolio_holdings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw error
  }

  return fetchPortfolioHoldings()
}

export async function replacePortfolioHoldings(holdings: Omit<PortfolioHolding, 'id'>[]) {
  const { supabase, user } = await getAuthenticatedClient()
  const { error: deleteError } = await supabase
    .from('portfolio_holdings')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) {
    throw deleteError
  }

  if (holdings.length > 0) {
    const payload = holdings.map((holding) => ({
      user_id: user.id,
      name: holding.name,
      ticker: holding.ticker,
      shares: holding.shares,
      average_price: holding.averagePrice,
      current_price: holding.currentPrice,
      account_type: holding.accountType,
    }))

    const { error: insertError } = await supabase.from('portfolio_holdings').insert(payload)

    if (insertError) {
      throw insertError
    }
  }

  return fetchPortfolioHoldings()
}

export function getDataErrorMessage(message?: string) {
  if (!message) {
    return 'Noe gikk galt. Prøv igjen.'
  }

  if (message.includes('relation') || message.includes('does not exist')) {
    return 'Databasetabellene mangler i Supabase. Kjør oppdatert SQL-skjema først.'
  }

  if (message.includes('row-level security') || message.includes('permission denied')) {
    return 'Supabase avviste forespørselen. Kontroller RLS-policyene for brukertabellene.'
  }

  if (message.includes('JWT') || message.includes('session')) {
    return 'Økten din er utløpt. Logg inn på nytt og prøv igjen.'
  }

  return 'Noe gikk galt. Prøv igjen.'
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

export function getBudgetAllocationTotal(settings: DashboardSettings) {
  return (
    settings.bufferAllocationPct +
    (settings.bsuEnabled ? settings.bsuAllocationPct : 0) +
    settings.investmentAllocationPct
  )
}
