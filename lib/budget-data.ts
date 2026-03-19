import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import {
  fetchDashboardSettingsBundle,
  getDataErrorMessage,
  type DashboardSettings,
} from '@/lib/dashboard-data'

export type BudgetPlan = 'free' | 'pro' | 'teams'
export type BudgetCategoryKind = 'income' | 'expense' | 'savings'
export type BudgetRuleMatchType = 'merchant_exact' | 'merchant_contains'
export type BudgetTransactionSource = 'manual' | 'csv_import' | 'smart_rule'

export interface BudgetWorkspace {
  id: string
  name: string
  currency: string
  isPrimary: boolean
}

export interface BudgetPeriod {
  id: string
  label: string
  monthStart: string
  monthEnd: string
  status: 'draft' | 'active' | 'closed'
}

export interface BudgetCategory {
  id: string
  name: string
  kind: BudgetCategoryKind
  budgetedAmount: number
  sortOrder: number
  isDefault: boolean
}

export interface BudgetTransaction {
  id: string
  periodId: string | null
  categoryId: string | null
  transactionDate: string
  merchant: string
  note: string
  amount: number
  kind: BudgetCategoryKind
  source: BudgetTransactionSource
}

export interface BudgetRule {
  id: string
  categoryId: string | null
  matchType: BudgetRuleMatchType
  pattern: string
  priority: number
}

export interface BudgetCategorySummary {
  category: BudgetCategory
  actualAmount: number
  remainingAmount: number
  utilizationPct: number
}

export interface BudgetSummary {
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  netCashflow: number
  plannedIncome: number
  plannedExpenses: number
  plannedSavings: number
}

export interface BudgetSavingsThread {
  availableToSave: number
  availableToInvest: number
  availableToBsu: number
  availableToBuffer: number
  availableGeneralSavings: number
  bsuEnabled: boolean
  bufferAllocationPct: number
  bsuAllocationPct: number
  investmentAllocationPct: number
  plannedIncome: number
  plannedExpenses: number
  plannedSavings: number
  actualNetCashflow: number
}

export interface BudgetInsight {
  title: string
  description: string
  tone: 'neutral' | 'positive' | 'warning'
}

export interface BudgetDashboardData {
  plan: BudgetPlan
  workspace: BudgetWorkspace
  periods: BudgetPeriod[]
  currentPeriod: BudgetPeriod
  categories: BudgetCategory[]
  transactions: BudgetTransaction[]
  rules: BudgetRule[]
  savingsThread: BudgetSavingsThread
}

export interface BudgetTransactionInput {
  periodId: string
  categoryId: string
  transactionDate: string
  merchant: string
  note?: string
  amount: number
  source?: BudgetTransactionSource
}

export type BudgetExportLang = 'no' | 'en'

interface ProfileRow {
  plan?: BudgetPlan | null
}

interface WorkspaceRow {
  id: string
  name: string
  currency: string
  is_primary: boolean
}

interface PeriodRow {
  id: string
  label: string
  month_start: string
  month_end: string
  status: BudgetPeriod['status']
}

interface CategoryRow {
  id: string
  name: string
  kind: BudgetCategoryKind
  budgeted_amount: number
  sort_order: number
  is_default: boolean
}

interface TransactionRow {
  id: string
  period_id: string | null
  category_id: string | null
  transaction_date: string
  merchant: string
  note: string
  amount: number
  kind: BudgetCategoryKind
  source: BudgetTransactionSource
}

interface RuleRow {
  id: string
  category_id: string | null
  match_type: BudgetRuleMatchType
  pattern: string
  priority: number
}

interface ParsedBudgetCsvRow {
  transactionDate: string
  merchant: string
  amount: number
  categoryName?: string
  kind?: BudgetCategoryKind
  note?: string
}

function normalizeImportedDate(value: string) {
  const trimmed = value.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const dottedMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dottedMatch) {
    const [, day, month, year] = dottedMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const [, day, month, year] = slashMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return toIsoDate(parsed)
  }

  return toIsoDate(new Date())
}

const DEFAULT_BUDGET_CATEGORIES: Array<{
  name: string
  kind: BudgetCategoryKind
  budgetedAmount: number
  sortOrder: number
  isDefault: boolean
}> = [
  { name: 'Lonn', kind: 'income', budgetedAmount: 42000, sortOrder: 10, isDefault: true },
  { name: 'Ekstrainntekt', kind: 'income', budgetedAmount: 2500, sortOrder: 20, isDefault: true },
  { name: 'Bolig', kind: 'expense', budgetedAmount: 13500, sortOrder: 30, isDefault: true },
  { name: 'Mat', kind: 'expense', budgetedAmount: 5200, sortOrder: 40, isDefault: true },
  { name: 'Transport', kind: 'expense', budgetedAmount: 2200, sortOrder: 50, isDefault: true },
  { name: 'Abonnementer', kind: 'expense', budgetedAmount: 900, sortOrder: 60, isDefault: true },
  { name: 'Fritid', kind: 'expense', budgetedAmount: 2500, sortOrder: 70, isDefault: true },
  { name: 'Investering', kind: 'savings', budgetedAmount: 5000, sortOrder: 80, isDefault: true },
  { name: 'Buffer', kind: 'savings', budgetedAmount: 2000, sortOrder: 90, isDefault: true },
  { name: 'Diverse', kind: 'expense', budgetedAmount: 1500, sortOrder: 100, isDefault: true },
]

function mapWorkspace(row: WorkspaceRow): BudgetWorkspace {
  return {
    id: row.id,
    name: row.name,
    currency: row.currency,
    isPrimary: row.is_primary,
  }
}

function mapPeriod(row: PeriodRow): BudgetPeriod {
  return {
    id: row.id,
    label: row.label,
    monthStart: row.month_start,
    monthEnd: row.month_end,
    status: row.status,
  }
}

function mapCategory(row: CategoryRow): BudgetCategory {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    budgetedAmount: Number(row.budgeted_amount ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    isDefault: row.is_default,
  }
}

function mapTransaction(row: TransactionRow): BudgetTransaction {
  return {
    id: row.id,
    periodId: row.period_id,
    categoryId: row.category_id,
    transactionDate: row.transaction_date,
    merchant: row.merchant,
    note: row.note,
    amount: Number(row.amount ?? 0),
    kind: row.kind,
    source: row.source,
  }
}

function mapRule(row: RuleRow): BudgetRule {
  return {
    id: row.id,
    categoryId: row.category_id,
    matchType: row.match_type,
    pattern: row.pattern,
    priority: row.priority,
  }
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase()
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('nb-NO', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function inferKindFromCategoryName(name: string): BudgetCategoryKind {
  const normalized = normalizeKey(name)

  if (normalized.includes('lonn') || normalized.includes('inntekt')) {
    return 'income'
  }

  if (normalized.includes('spar') || normalized.includes('buffer') || normalized.includes('invest')) {
    return 'savings'
  }

  return 'expense'
}

function inferKindFromValue(rawAmount: number, rawKind?: string): BudgetCategoryKind {
  if (rawKind) {
    const normalized = normalizeKey(rawKind)
    if (normalized.startsWith('inn')) {
      return 'income'
    }
    if (normalized.startsWith('spa')) {
      return 'savings'
    }
    if (normalized.startsWith('exp') || normalized.startsWith('utg')) {
      return 'expense'
    }
  }

  if (rawAmount < 0) {
    return 'expense'
  }

  return 'income'
}

async function getAuthenticatedBudgetClient() {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('Du maa vaere logget inn for aa bruke budsjettet.')
  }

  const profileResult = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  if (profileResult.error) {
    throw profileResult.error
  }

  return {
    supabase,
    user,
    plan: (profileResult.data as ProfileRow | null)?.plan ?? 'free',
  }
}

async function ensurePrimaryWorkspace() {
  const { supabase, user, plan } = await getAuthenticatedBudgetClient()

  const workspacesResult = await supabase
    .from('budget_workspaces')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (workspacesResult.error) {
    throw workspacesResult.error
  }

  let rows = (workspacesResult.data ?? []) as WorkspaceRow[]

  if (rows.length === 0) {
    const insertResult = await supabase
      .from('budget_workspaces')
      .insert({
        user_id: user.id,
        name: 'Husholdning',
        currency: 'NOK',
        is_primary: true,
      })
      .select('*')
      .single()

    if (insertResult.error) {
      throw insertResult.error
    }

    rows = [insertResult.data as WorkspaceRow]
  }

  const workspace = rows.find((row) => row.is_primary) ?? rows[0]

  return {
    supabase,
    user,
    plan,
    workspace: mapWorkspace(workspace),
  }
}

async function ensureDefaultCategories(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  workspaceId: string
) {
  const result = await supabase
    .from('budget_categories')
    .select('*')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .order('sort_order', { ascending: true })

  if (result.error) {
    throw result.error
  }

  let rows = (result.data ?? []) as CategoryRow[]

  if (rows.length === 0) {
    const insertResult = await supabase
      .from('budget_categories')
      .insert(
        DEFAULT_BUDGET_CATEGORIES.map((category) => ({
          user_id: userId,
          workspace_id: workspaceId,
          name: category.name,
          kind: category.kind,
          budgeted_amount: category.budgetedAmount,
          sort_order: category.sortOrder,
          is_default: category.isDefault,
        }))
      )
      .select('*')

    if (insertResult.error) {
      throw insertResult.error
    }

    rows = (insertResult.data ?? []) as CategoryRow[]
  }

  return rows.map(mapCategory)
}

async function ensureBudgetPeriod(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  workspaceId: string,
  monthStartIso: string
) {
  const result = await supabase
    .from('budget_periods')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('month_start', monthStartIso)
    .maybeSingle()

  if (result.error) {
    throw result.error
  }

  if (result.data) {
    return mapPeriod(result.data as PeriodRow)
  }

  const monthStart = new Date(`${monthStartIso}T00:00:00`)
  const monthEnd = endOfMonth(monthStart)

  const insertResult = await supabase
    .from('budget_periods')
    .insert({
      user_id: userId,
      workspace_id: workspaceId,
      label: formatMonthLabel(monthStart),
      month_start: monthStartIso,
      month_end: toIsoDate(monthEnd),
      status: 'active',
    })
    .select('*')
    .single()

  if (insertResult.error) {
    throw insertResult.error
  }

  return mapPeriod(insertResult.data as PeriodRow)
}

async function fetchWorkspacePeriods(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  workspaceId: string
) {
  const result = await supabase
    .from('budget_periods')
    .select('*')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .order('month_start', { ascending: false })

  if (result.error) {
    throw result.error
  }

  return ((result.data ?? []) as PeriodRow[]).map(mapPeriod)
}

async function fetchBudgetRules(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  workspaceId: string
) {
  const result = await supabase
    .from('budget_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })

  if (result.error) {
    throw result.error
  }

  return ((result.data ?? []) as RuleRow[]).map(mapRule)
}

async function upsertMerchantRule(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  workspaceId: string,
  categoryId: string,
  merchant: string
) {
  const trimmed = merchant.trim()

  if (!trimmed) {
    return
  }

  const existingResult = await supabase
    .from('budget_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .eq('match_type', 'merchant_exact')
    .eq('pattern', trimmed)
    .maybeSingle()

  if (existingResult.error) {
    throw existingResult.error
  }

  if (existingResult.data) {
    const existing = existingResult.data as RuleRow
    const updateResult = await supabase
      .from('budget_rules')
      .update({ category_id: categoryId, priority: 10 })
      .eq('id', existing.id)

    if (updateResult.error) {
      throw updateResult.error
    }

    return
  }

  const insertResult = await supabase.from('budget_rules').insert({
    user_id: userId,
    workspace_id: workspaceId,
    category_id: categoryId,
    match_type: 'merchant_exact',
    pattern: trimmed,
    priority: 10,
  })

  if (insertResult.error) {
    throw insertResult.error
  }
}

function parseAmount(value: string) {
  const normalized = value
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '')

  return Number(normalized)
}

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  cells.push(current.trim())

  return cells
}

function parseBudgetCsv(csvText: string): ParsedBudgetCsvRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return []
  }

  const headers = parseCsvLine(lines[0]).map(normalizeKey)

  return lines.slice(1).flatMap((line) => {
    const values = parseCsvLine(line)
    const row = headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? ''
      return acc
    }, {})

    const amount = parseAmount(row.amount ?? row.belop ?? row.sum ?? '')

    if (!Number.isFinite(amount) || amount === 0) {
      return []
    }

    const transactionDate =
      row.date || row.dato || row.transaction_date || row.transaksjonsdato || toIsoDate(new Date())

    return [
      {
        transactionDate: normalizeImportedDate(transactionDate),
        merchant: row.merchant || row.beskrivelse || row.description || 'Ukjent transaksjon',
        amount: Math.abs(amount),
        categoryName: row.category || row.kategori || undefined,
        kind: inferKindFromValue(amount, row.kind || row.type || row.retning),
        note: row.note || row.kommentar || '',
      },
    ]
  })
}

function formatCsvValue(value: string | number) {
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnToLetter(columnIndex: number) {
  let result = ''
  let index = columnIndex + 1

  while (index > 0) {
    const remainder = (index - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    index = Math.floor((index - 1) / 26)
  }

  return result
}

function crc32(input: Uint8Array) {
  let crc = -1

  for (let index = 0; index < input.length; index += 1) {
    crc ^= input[index]

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }

  return (crc ^ -1) >>> 0
}

function concatUint8Arrays(chunks: Uint8Array[]) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(totalLength)
  let offset = 0

  chunks.forEach((chunk) => {
    output.set(chunk, offset)
    offset += chunk.length
  })

  return output
}

function createStoredZip(files: Array<{ path: string; content: string }>) {
  const encoder = new TextEncoder()
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.path)
    const dataBytes = encoder.encode(file.content)
    const checksum = crc32(dataBytes)

    const localHeader = new Uint8Array(30 + nameBytes.length)
    const localView = new DataView(localHeader.buffer)
    localView.setUint32(0, 0x04034b50, true)
    localView.setUint16(4, 20, true)
    localView.setUint16(6, 0, true)
    localView.setUint16(8, 0, true)
    localView.setUint16(10, 0, true)
    localView.setUint16(12, 0, true)
    localView.setUint32(14, checksum, true)
    localView.setUint32(18, dataBytes.length, true)
    localView.setUint32(22, dataBytes.length, true)
    localView.setUint16(26, nameBytes.length, true)
    localView.setUint16(28, 0, true)
    localHeader.set(nameBytes, 30)

    localParts.push(localHeader, dataBytes)

    const centralHeader = new Uint8Array(46 + nameBytes.length)
    const centralView = new DataView(centralHeader.buffer)
    centralView.setUint32(0, 0x02014b50, true)
    centralView.setUint16(4, 20, true)
    centralView.setUint16(6, 20, true)
    centralView.setUint16(8, 0, true)
    centralView.setUint16(10, 0, true)
    centralView.setUint16(12, 0, true)
    centralView.setUint16(14, 0, true)
    centralView.setUint32(16, checksum, true)
    centralView.setUint32(20, dataBytes.length, true)
    centralView.setUint32(24, dataBytes.length, true)
    centralView.setUint16(28, nameBytes.length, true)
    centralView.setUint16(30, 0, true)
    centralView.setUint16(32, 0, true)
    centralView.setUint16(34, 0, true)
    centralView.setUint16(36, 0, true)
    centralView.setUint32(38, 0, true)
    centralView.setUint32(42, offset, true)
    centralHeader.set(nameBytes, 46)

    centralParts.push(centralHeader)
    offset += localHeader.length + dataBytes.length
  })

  const centralDirectory = concatUint8Arrays(centralParts)
  const localDirectory = concatUint8Arrays(localParts)
  const endRecord = new Uint8Array(22)
  const endView = new DataView(endRecord.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(4, 0, true)
  endView.setUint16(6, 0, true)
  endView.setUint16(8, files.length, true)
  endView.setUint16(10, files.length, true)
  endView.setUint32(12, centralDirectory.length, true)
  endView.setUint32(16, localDirectory.length, true)
  endView.setUint16(20, 0, true)

  return concatUint8Arrays([localDirectory, centralDirectory, endRecord])
}

const BUDGET_EXPORT_LABELS: Record<
  BudgetExportLang,
  {
    summarySheet: string
    categoriesSheet: string
    transactionsSheet: string
    summaryTitle: string
    period: string
    workspace: string
    plan: string
    exportedAt: string
    metricsLabel: string
    metricsValue: string
    incomeActual: string
    expensesActual: string
    savingsActual: string
    netCashflow: string
    incomePlanned: string
    expensesPlanned: string
    savingsPlanned: string
    category: string
    type: string
    amount: string
    budgeted: string
    actual: string
    remaining: string
    usedPct: string
    transactionCount: string
    date: string
    merchant: string
    note: string
    source: string
    noTransactions: string
    freePlan: string
    proPlan: string
  }
> = {
  no: {
    summarySheet: 'Sammendrag',
    categoriesSheet: 'Kategorier',
    transactionsSheet: 'Transaksjoner',
    summaryTitle: 'Budsjettoversikt',
    period: 'Periode',
    workspace: 'Arbeidsflate',
    plan: 'Plan',
    exportedAt: 'Eksportert',
    metricsLabel: 'Nøkkeltall',
    metricsValue: 'Verdi',
    incomeActual: 'Faktiske inntekter',
    expensesActual: 'Faktiske utgifter',
    savingsActual: 'Faktisk sparing',
    netCashflow: 'Netto kontantstrøm',
    incomePlanned: 'Budsjetterte inntekter',
    expensesPlanned: 'Budsjetterte utgifter',
    savingsPlanned: 'Budsjettert sparing',
    category: 'Kategori',
    type: 'Type',
    amount: 'Beløp',
    budgeted: 'Budsjett',
    actual: 'Faktisk',
    remaining: 'Igjen',
    usedPct: 'Brukt %',
    transactionCount: 'Transaksjoner',
    date: 'Dato',
    merchant: 'Beskrivelse',
    note: 'Notat',
    source: 'Kilde',
    noTransactions: 'Ingen transaksjoner i valgt periode',
    freePlan: 'Gratis',
    proPlan: 'Pro',
  },
  en: {
    summarySheet: 'Summary',
    categoriesSheet: 'Categories',
    transactionsSheet: 'Transactions',
    summaryTitle: 'Budget overview',
    period: 'Period',
    workspace: 'Workspace',
    plan: 'Plan',
    exportedAt: 'Exported',
    metricsLabel: 'Metric',
    metricsValue: 'Value',
    incomeActual: 'Actual income',
    expensesActual: 'Actual expenses',
    savingsActual: 'Actual savings',
    netCashflow: 'Net cashflow',
    incomePlanned: 'Planned income',
    expensesPlanned: 'Planned expenses',
    savingsPlanned: 'Planned savings',
    category: 'Category',
    type: 'Type',
    amount: 'Amount',
    budgeted: 'Budgeted',
    actual: 'Actual',
    remaining: 'Remaining',
    usedPct: 'Used %',
    transactionCount: 'Transactions',
    date: 'Date',
    merchant: 'Description',
    note: 'Note',
    source: 'Source',
    noTransactions: 'No transactions in the selected period',
    freePlan: 'Free',
    proPlan: 'Pro',
  },
}

function localizeBudgetKind(kind: BudgetCategoryKind, lang: BudgetExportLang) {
  if (lang === 'en') {
    if (kind === 'income') return 'Income'
    if (kind === 'savings') return 'Savings'
    return 'Expense'
  }

  if (kind === 'income') return 'Inntekt'
  if (kind === 'savings') return 'Sparing'
  return 'Utgift'
}

function localizeBudgetSource(source: BudgetTransactionSource, lang: BudgetExportLang) {
  if (lang === 'en') {
    if (source === 'manual') return 'Manual'
    if (source === 'csv_import') return 'CSV import'
    return 'Smart rule'
  }

  if (source === 'manual') return 'Manuell'
  if (source === 'csv_import') return 'CSV-import'
  return 'Smart regel'
}

function buildBudgetExportSheets(data: BudgetDashboardData, lang: BudgetExportLang) {
  const labels = BUDGET_EXPORT_LABELS[lang]
  const categoryMap = new Map(data.categories.map((category) => [category.id, category]))
  const summary = summarizeBudget(data.categories, data.transactions)
  const categorySummaries = summarizeBudgetCategories(data.categories, data.transactions)

  const summaryRows: Array<Array<string | number>> = [
    [labels.summaryTitle, ''],
    [labels.period, data.currentPeriod.label],
    [labels.workspace, data.workspace.name],
    [labels.plan, data.plan === 'free' ? labels.freePlan : labels.proPlan],
    [labels.exportedAt, new Intl.DateTimeFormat(lang === 'no' ? 'nb-NO' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date())],
    [],
    [labels.metricsLabel, labels.metricsValue],
    [labels.incomeActual, formatBudgetCurrency(summary.totalIncome)],
    [labels.expensesActual, formatBudgetCurrency(summary.totalExpenses)],
    [labels.savingsActual, formatBudgetCurrency(summary.totalSavings)],
    [labels.netCashflow, formatBudgetCurrency(summary.netCashflow)],
    [labels.incomePlanned, formatBudgetCurrency(summary.plannedIncome)],
    [labels.expensesPlanned, formatBudgetCurrency(summary.plannedExpenses)],
    [labels.savingsPlanned, formatBudgetCurrency(summary.plannedSavings)],
  ]

  const categoryRows: Array<Array<string | number>> = [
    [
      labels.category,
      labels.type,
      labels.budgeted,
      labels.actual,
      labels.remaining,
      labels.usedPct,
      labels.transactionCount,
    ],
    ...categorySummaries.map((row) => [
      row.category.name,
      localizeBudgetKind(row.category.kind, lang),
      formatBudgetCurrency(row.category.budgetedAmount),
      formatBudgetCurrency(row.actualAmount),
      formatBudgetCurrency(row.remainingAmount),
      `${Math.round(row.utilizationPct)} %`,
      data.transactions.filter((transaction) => transaction.categoryId === row.category.id).length,
    ]),
  ]

  const transactionRows: Array<Array<string | number>> = [
    [
      labels.date,
      labels.merchant,
      labels.category,
      labels.type,
      labels.amount,
      labels.note,
      labels.source,
    ],
    ...(data.transactions.length > 0
      ? data.transactions.map((transaction) => [
          transaction.transactionDate,
          transaction.merchant,
          transaction.categoryId ? categoryMap.get(transaction.categoryId)?.name ?? '' : '',
          localizeBudgetKind(transaction.kind, lang),
          formatBudgetCurrency(transaction.amount),
          transaction.note,
          localizeBudgetSource(transaction.source, lang),
        ])
      : [[labels.noTransactions, '', '', '', '', '', '']]),
  ]

  return [
    { name: labels.summarySheet, rows: summaryRows },
    { name: labels.categoriesSheet, rows: categoryRows },
    { name: labels.transactionsSheet, rows: transactionRows },
  ]
}

function buildWorksheetXml(rows: Array<Array<string | number>>) {
  const maxColumns = Math.max(...rows.map((row) => row.length), 1)
  const lastCell = `${columnToLetter(maxColumns - 1)}${rows.length}`
  const rowXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) => {
          const ref = `${columnToLetter(columnIndex)}${rowIndex + 1}`
          const text = escapeXml(String(value ?? ''))
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`
        })
        .join('')

      return `<row r="${rowIndex + 1}">${cells}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastCell}"/>
  <sheetData>${rowXml}</sheetData>
</worksheet>`
}

export async function fetchBudgetDashboardData(periodId?: string): Promise<BudgetDashboardData> {
  const { supabase, user, plan, workspace } = await ensurePrimaryWorkspace()
  const categories = await ensureDefaultCategories(supabase, user.id, workspace.id)
  const settingsBundle = await fetchDashboardSettingsBundle()

  const today = new Date()
  const currentMonthStart = toIsoDate(startOfMonth(today))
  const ensuredPeriod = await ensureBudgetPeriod(supabase, user.id, workspace.id, currentMonthStart)
  let periods = await fetchWorkspacePeriods(supabase, user.id, workspace.id)

  if (!periods.some((period) => period.id === ensuredPeriod.id)) {
    periods = [ensuredPeriod, ...periods]
  }

  const currentPeriod =
    periods.find((period) => period.id === periodId) ??
    periods.find((period) => period.id === ensuredPeriod.id) ??
    periods[0]

  const transactionsResult = await supabase
    .from('budget_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspace.id)
    .eq('period_id', currentPeriod.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (transactionsResult.error) {
    throw transactionsResult.error
  }

  const rules = await fetchBudgetRules(supabase, user.id, workspace.id)
  const transactions = ((transactionsResult.data ?? []) as TransactionRow[]).map(mapTransaction)

  return {
    plan,
    workspace,
    periods,
    currentPeriod,
    categories,
    transactions,
    rules,
    savingsThread: deriveBudgetSavingsThread(categories, transactions, settingsBundle.settings),
  }
}

export async function fetchBudgetSavingsThread() {
  const data = await fetchBudgetDashboardData()
  return data.savingsThread
}

export async function createBudgetPeriod(monthStartIso?: string) {
  const { supabase, user, workspace } = await ensurePrimaryWorkspace()
  const target = monthStartIso ?? toIsoDate(startOfMonth(new Date()))
  return ensureBudgetPeriod(supabase, user.id, workspace.id, target)
}

export async function updateBudgetCategoryBudget(categoryId: string, budgetedAmount: number) {
  const { supabase, user } = await getAuthenticatedBudgetClient()
  const result = await supabase
    .from('budget_categories')
    .update({ budgeted_amount: budgetedAmount })
    .eq('id', categoryId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (result.error) {
    throw result.error
  }

  return mapCategory(result.data as CategoryRow)
}

export async function createBudgetTransaction(input: BudgetTransactionInput) {
  const { supabase, user, workspace } = await ensurePrimaryWorkspace()

  const categoryResult = await supabase
    .from('budget_categories')
    .select('*')
    .eq('id', input.categoryId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (categoryResult.error) {
    throw categoryResult.error
  }

  if (!categoryResult.data) {
    throw new Error('Kunne ikke finne kategorien for transaksjonen.')
  }

  const category = mapCategory(categoryResult.data as CategoryRow)
  const insertResult = await supabase.from('budget_transactions').insert({
    user_id: user.id,
    workspace_id: workspace.id,
    period_id: input.periodId,
    category_id: input.categoryId,
    transaction_date: input.transactionDate,
    merchant: input.merchant.trim(),
    note: input.note?.trim() ?? '',
    amount: input.amount,
    kind: category.kind,
    source: input.source ?? 'manual',
  })

  if (insertResult.error) {
    throw insertResult.error
  }

  await upsertMerchantRule(supabase, user.id, workspace.id, input.categoryId, input.merchant)
  return fetchBudgetDashboardData(input.periodId)
}

export async function deleteBudgetTransaction(transactionId: string, periodId: string) {
  const { supabase, user } = await getAuthenticatedBudgetClient()
  const result = await supabase
    .from('budget_transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', user.id)

  if (result.error) {
    throw result.error
  }

  return fetchBudgetDashboardData(periodId)
}

export async function importBudgetCsv(csvText: string, periodId: string) {
  const parsedRows = parseBudgetCsv(csvText)

  if (parsedRows.length === 0) {
    throw new Error('CSV-filen ser tom ut eller mangler gyldige rader.')
  }

  const { supabase, user, workspace } = await ensurePrimaryWorkspace()
  const snapshot = await fetchBudgetDashboardData(periodId)

  const categories = [...snapshot.categories]
  const categoryMap = new Map(categories.map((category) => [normalizeKey(category.name), category]))
  const rules = [...snapshot.rules]
  const batchId = crypto.randomUUID()

  for (const row of parsedRows) {
    if (row.categoryName && !categoryMap.has(normalizeKey(row.categoryName))) {
      const insertResult = await supabase
        .from('budget_categories')
        .insert({
          user_id: user.id,
          workspace_id: workspace.id,
          name: row.categoryName.trim(),
          kind: row.kind ?? inferKindFromCategoryName(row.categoryName),
          budgeted_amount: 0,
          sort_order: categories.length * 10 + 100,
          is_default: false,
        })
        .select('*')
        .single()

      if (insertResult.error) {
        throw insertResult.error
      }

      const category = mapCategory(insertResult.data as CategoryRow)
      categories.push(category)
      categoryMap.set(normalizeKey(category.name), category)
    }
  }

  const payload = parsedRows.map((row) => {
    const normalizedMerchant = row.merchant.trim()
    const normalizedCategory = row.categoryName ? normalizeKey(row.categoryName) : null
    const matchedRule = rules.find((rule) => {
      const pattern = normalizeKey(rule.pattern)
      const merchant = normalizeKey(normalizedMerchant)

      if (rule.matchType === 'merchant_exact') {
        return merchant === pattern
      }

      return merchant.includes(pattern)
    })

    const category =
      (normalizedCategory ? categoryMap.get(normalizedCategory) : undefined) ??
      categories.find((item) => item.id === matchedRule?.categoryId) ??
      categories.find((item) => item.name === 'Diverse') ??
      categories.find((item) => item.kind === (row.kind ?? 'expense'))

    if (!category) {
      throw new Error('Kunne ikke mappe en eller flere rader til en kategori.')
    }

    return {
      user_id: user.id,
      workspace_id: workspace.id,
      period_id: periodId,
      category_id: category.id,
      transaction_date: row.transactionDate,
      merchant: normalizedMerchant,
      note: row.note ?? '',
      amount: row.amount,
      kind: category.kind,
      source: matchedRule ? 'smart_rule' : 'csv_import',
      import_batch_id: batchId,
    }
  })

  const insertResult = await supabase.from('budget_transactions').insert(payload)

  if (insertResult.error) {
    throw insertResult.error
  }

  return fetchBudgetDashboardData(periodId)
}

export function summarizeBudget(
  categories: BudgetCategory[],
  transactions: BudgetTransaction[]
): BudgetSummary {
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.kind === 'income') {
        acc.totalIncome += transaction.amount
      } else if (transaction.kind === 'expense') {
        acc.totalExpenses += transaction.amount
      } else {
        acc.totalSavings += transaction.amount
      }
      return acc
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
    }
  )

  const plannedExpenses = categories
    .filter((category) => category.kind === 'expense')
    .reduce((sum, category) => sum + category.budgetedAmount, 0)

  const plannedSavings = categories
    .filter((category) => category.kind === 'savings')
    .reduce((sum, category) => sum + category.budgetedAmount, 0)

  const plannedIncome = categories
    .filter((category) => category.kind === 'income')
    .reduce((sum, category) => sum + category.budgetedAmount, 0)

  return {
    totalIncome: totals.totalIncome,
    totalExpenses: totals.totalExpenses,
    totalSavings: totals.totalSavings,
    netCashflow: totals.totalIncome - totals.totalExpenses - totals.totalSavings,
    plannedIncome,
    plannedExpenses,
    plannedSavings,
  }
}

export function deriveBudgetSavingsThread(
  categories: BudgetCategory[],
  transactions: BudgetTransaction[],
  settings: DashboardSettings
): BudgetSavingsThread {
  const summary = summarizeBudget(categories, transactions)
  const availableToSave = Math.max(0, summary.plannedIncome - summary.plannedExpenses)
  const bufferRatio = Math.max(0, settings.bufferAllocationPct) / 100
  const bsuRatio = settings.bsuEnabled ? Math.max(0, settings.bsuAllocationPct) / 100 : 0
  const investmentRatio =
    Math.max(0, settings.investmentAllocationPct + (settings.bsuEnabled ? 0 : settings.bsuAllocationPct)) /
    100
  const monthlyBsuCap = 27500 / 12

  const availableToBuffer = availableToSave * bufferRatio
  const rawBsuAllocation = availableToSave * bsuRatio
  const availableToBsu = Math.min(rawBsuAllocation, monthlyBsuCap)
  const bsuOverflow = Math.max(0, rawBsuAllocation - availableToBsu)
  const availableToInvest = availableToSave * investmentRatio + bsuOverflow
  const allocatedTotal = availableToBuffer + availableToBsu + availableToInvest
  const availableGeneralSavings = Math.max(0, availableToSave - allocatedTotal)

  return {
    availableToSave,
    availableToInvest,
    availableToBsu,
    availableToBuffer,
    availableGeneralSavings,
    bsuEnabled: settings.bsuEnabled,
    bufferAllocationPct: settings.bufferAllocationPct,
    bsuAllocationPct: settings.bsuEnabled ? settings.bsuAllocationPct : 0,
    investmentAllocationPct:
      settings.investmentAllocationPct + (settings.bsuEnabled ? 0 : settings.bsuAllocationPct),
    plannedIncome: summary.plannedIncome,
    plannedExpenses: summary.plannedExpenses,
    plannedSavings: summary.plannedSavings,
    actualNetCashflow: summary.netCashflow,
  }
}

export function summarizeBudgetCategories(
  categories: BudgetCategory[],
  transactions: BudgetTransaction[]
) {
  return categories.map((category) => {
    const actualAmount = transactions
      .filter((transaction) => transaction.categoryId === category.id)
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const remainingAmount = category.budgetedAmount - actualAmount
    const utilizationPct =
      category.budgetedAmount > 0 ? (actualAmount / category.budgetedAmount) * 100 : 0

    return {
      category,
      actualAmount,
      remainingAmount,
      utilizationPct,
    } satisfies BudgetCategorySummary
  })
}

export function buildBudgetInsights(
  period: BudgetPeriod,
  categories: BudgetCategory[],
  transactions: BudgetTransaction[]
) {
  const categorySummaries = summarizeBudgetCategories(categories, transactions)
  const summary = summarizeBudget(categories, transactions)
  const expenseSummaries = categorySummaries
    .filter((item) => item.category.kind === 'expense')
    .sort((left, right) => right.actualAmount - left.actualAmount)

  const topExpense = expenseSummaries[0]
  const overspending = expenseSummaries.filter((item) => item.remainingAmount < 0)
  const insights: BudgetInsight[] = []

  if (topExpense && topExpense.actualAmount > 0) {
    insights.push({
      title: 'Stoerste utgiftspost',
      description: `${topExpense.category.name} er størst denne perioden med ${formatBudgetCurrency(topExpense.actualAmount)} i forbruk.`,
      tone: 'neutral',
    })
  }

  if (overspending.length > 0) {
    insights.push({
      title: 'Bruker mer enn planlagt',
      description: `${overspending.length} kategorier ligger over budsjett i ${period.label}. Se spesielt ${overspending[0].category.name}.`,
      tone: 'warning',
    })
  } else {
    insights.push({
      title: 'Holder rammen',
      description: `Ingen utgiftskategorier ligger over plan så langt i ${period.label}.`,
      tone: 'positive',
    })
  }

  insights.push({
    title: 'Kan settes av',
    description: `Netto kontantstrøm denne perioden er ${formatBudgetCurrency(summary.netCashflow)} etter utgifter og sparing.`,
    tone: summary.netCashflow >= 0 ? 'positive' : 'warning',
  })

  return insights
}

export function buildBudgetJsonExport(data: BudgetDashboardData) {
  const categoryMap = new Map(data.categories.map((category) => [category.id, category]))

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      workspace: data.workspace,
      plan: data.plan,
      period: data.currentPeriod,
      categories: data.categories,
      transactions: data.transactions.map((transaction) => ({
        ...transaction,
        categoryName: transaction.categoryId
          ? categoryMap.get(transaction.categoryId)?.name ?? null
          : null,
      })),
      summary: summarizeBudget(data.categories, data.transactions),
    },
    null,
    2
  )
}

export function buildBudgetCsvExport(data: BudgetDashboardData, lang: BudgetExportLang = 'no') {
  const sheets = buildBudgetExportSheets(data, lang)
  const sections = sheets.map((sheet) =>
    [sheet.name, ...sheet.rows.map((row) => row.map(formatCsvValue).join(','))].join('\n')
  )

  return `\uFEFF${sections.join('\n\n')}`
}

export function buildBudgetXlsxExport(data: BudgetDashboardData, lang: BudgetExportLang = 'no') {
  const sheets = buildBudgetExportSheets(data, lang)
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheets
      .map(
        (sheet, index) =>
          `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
      )
      .join('')}
  </sheets>
</workbook>`

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheets
    .map(
      (_sheet, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
    )
    .join('')}
</Relationships>`

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${sheets
    .map(
      (_sheet, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('')}
</Types>`

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  const archive = createStoredZip([
    { path: '[Content_Types].xml', content: contentTypesXml },
    { path: '_rels/.rels', content: rootRelsXml },
    { path: 'xl/workbook.xml', content: workbookXml },
    { path: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
    ...sheets.map((sheet, index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      content: buildWorksheetXml(sheet.rows),
    })),
  ])

  return new Blob([archive], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export function buildBudgetPrintHtml(data: BudgetDashboardData, lang: BudgetExportLang = 'no') {
  const sheets = buildBudgetExportSheets(data, lang)
  const labels = BUDGET_EXPORT_LABELS[lang]
  const sectionHtml = sheets
    .map(
      (sheet) => `
        <section class="report-section">
          <h2>${escapeXml(sheet.name)}</h2>
          <table>
            <tbody>
              ${sheet.rows
                .map(
                  (row, rowIndex) => `
                    <tr>
                      ${row
                        .map((cell) =>
                          rowIndex === 0 && sheet !== sheets[0]
                            ? `<th>${escapeXml(String(cell ?? ''))}</th>`
                            : `<td>${escapeXml(String(cell ?? ''))}</td>`
                        )
                        .join('')}
                    </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </section>`
    )
    .join('')

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeXml(labels.summaryTitle)} - ${escapeXml(data.currentPeriod.label)}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 32px; }
      h1 { margin: 0 0 8px; font-size: 28px; }
      p { margin: 0 0 18px; color: #4b5563; }
      .report-section { margin-top: 28px; }
      h2 { margin: 0 0 10px; font-size: 18px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #f3f4f6; font-weight: 700; }
      @media print { body { margin: 18px; } }
    </style>
  </head>
  <body>
    <h1>${escapeXml(labels.summaryTitle)}</h1>
    <p>${escapeXml(data.currentPeriod.label)} · ${escapeXml(data.workspace.name)}</p>
    ${sectionHtml}
  </body>
</html>`
}

export function formatBudgetCurrency(value: number) {
  return value.toLocaleString('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  })
}

export function getBudgetErrorMessage(message?: string) {
  if (!message) {
    return getDataErrorMessage()
  }

  if (message.includes('CSV')) {
    return message
  }

  return getDataErrorMessage(message)
}
