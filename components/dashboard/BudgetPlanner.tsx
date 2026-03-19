'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useMemo, useState } from 'react'
import { getStoredExportLanguage, resolveExportLanguage } from '@/lib/client-preferences'
import {
  buildBudgetCsvExport,
  buildBudgetPrintHtml,
  buildBudgetXlsxExport,
  buildBudgetInsights,
  buildBudgetJsonExport,
  createBudgetPeriod,
  createBudgetTransaction,
  deleteBudgetTransaction,
  fetchBudgetDashboardData,
  formatBudgetCurrency,
  getBudgetErrorMessage,
  importBudgetCsv,
  summarizeBudget,
  summarizeBudgetCategories,
  updateBudgetCategoryBudget,
  type BudgetCategory,
  type BudgetCategoryKind,
  type BudgetDashboardData,
} from '@/lib/budget-data'
import { useLang } from '@/lib/i18n'

function getTodayIsoDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentMonthValue() {
  return getTodayIsoDate().slice(0, 7)
}

const EMPTY_FORM = {
  transactionDate: getTodayIsoDate(),
  categoryId: '',
  merchant: '',
  amount: '',
  note: '',
}

export default function BudgetPlanner({
  initialData,
}: {
  initialData: BudgetDashboardData
}) {
  const { lang } = useLang()
  const [data, setData] = useState(initialData)
  const [transactionForm, setTransactionForm] = useState(() => ({
    ...EMPTY_FORM,
    categoryId: initialData.categories.find((category) => category.kind === 'expense')?.id ?? '',
  }))
  const [budgetDrafts, setBudgetDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialData.categories.map((category) => [category.id, String(category.budgetedAmount)])
    )
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newPeriodMonth, setNewPeriodMonth] = useState(getCurrentMonthValue())

  const categoryMap = useMemo(
    () => new Map(data.categories.map((category) => [category.id, category])),
    [data.categories]
  )
  const summary = useMemo(
    () => summarizeBudget(data.categories, data.transactions),
    [data.categories, data.transactions]
  )
  const categorySummaries = useMemo(
    () => summarizeBudgetCategories(data.categories, data.transactions),
    [data.categories, data.transactions]
  )
  const insights = useMemo(
    () => buildBudgetInsights(data.currentPeriod, data.categories, data.transactions),
    [data.currentPeriod, data.categories, data.transactions]
  )

  const incomeCategories = categorySummaries.filter((item) => item.category.kind === 'income')
  const expenseCategories = categorySummaries.filter((item) => item.category.kind === 'expense')
  const savingsCategories = categorySummaries.filter((item) => item.category.kind === 'savings')

  async function reload(periodId?: string) {
    setLoading(true)
    setError(null)

    try {
      const next = await fetchBudgetDashboardData(periodId)
      setData(next)
      setBudgetDrafts(
        Object.fromEntries(
          next.categories.map((category) => [category.id, String(category.budgetedAmount)])
        )
      )

      setTransactionForm((current) => ({
        ...current,
        categoryId:
          current.categoryId ||
          next.categories.find((category) => category.kind === 'expense')?.id ||
          '',
      }))
    } catch (loadError) {
      const message =
        loadError instanceof Error ? getBudgetErrorMessage(loadError.message) : getBudgetErrorMessage()
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePeriodChange(periodId: string) {
    await reload(periodId)
  }

  async function handleCreateNextPeriod() {
    const latest = [...data.periods].sort((left, right) =>
      left.monthStart < right.monthStart ? 1 : -1
    )[0]
    const nextDate = new Date(`${latest.monthStart}T00:00:00`)
    nextDate.setMonth(nextDate.getMonth() + 1)

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const period = await createBudgetPeriod(
        new Date(nextDate.getFullYear(), nextDate.getMonth(), 1).toISOString().slice(0, 10)
      )
      await reload(period.id)
      setSuccess(`Opprettet ny periode for ${period.label}.`)
    } catch (createError) {
      const message =
        createError instanceof Error
          ? getBudgetErrorMessage(createError.message)
          : getBudgetErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateSelectedPeriod() {
    if (!newPeriodMonth) {
      setError('Velg en måned først.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const period = await createBudgetPeriod(`${newPeriodMonth}-01`)
      await reload(period.id)
      setSuccess(`Perioden ${period.label} er klar og bruker samme kategorioppsett som sist.`)
    } catch (createError) {
      const message =
        createError instanceof Error
          ? getBudgetErrorMessage(createError.message)
          : getBudgetErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleGoToCurrentMonth() {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const period = await createBudgetPeriod(`${getCurrentMonthValue()}-01`)
      setNewPeriodMonth(getCurrentMonthValue())
      await reload(period.id)
      setSuccess(`Åpnet inneværende måned: ${period.label}.`)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? getBudgetErrorMessage(loadError.message) : getBudgetErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleTransactionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const amount = Number(transactionForm.amount)

    if (!transactionForm.categoryId || !transactionForm.merchant.trim() || amount <= 0) {
      setError('Fyll inn kategori, beskrivelse og et gyldig beløp for transaksjonen.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const next = await createBudgetTransaction({
        periodId: data.currentPeriod.id,
        categoryId: transactionForm.categoryId,
        transactionDate: transactionForm.transactionDate,
        merchant: transactionForm.merchant,
        amount,
        note: transactionForm.note,
      })
      setData(next)
      setBudgetDrafts(
        Object.fromEntries(
          next.categories.map((category) => [category.id, String(category.budgetedAmount)])
        )
      )
      setTransactionForm({
        ...EMPTY_FORM,
        categoryId: transactionForm.categoryId,
      })
      setSuccess('Transaksjonen ble lagret og merchant-regelen er oppdatert.')
    } catch (saveError) {
      const message =
        saveError instanceof Error ? getBudgetErrorMessage(saveError.message) : getBudgetErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTransaction(transactionId: string) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const next = await deleteBudgetTransaction(transactionId, data.currentPeriod.id)
      setData(next)
      setSuccess('Transaksjonen ble slettet.')
    } catch (removeError) {
      const message =
        removeError instanceof Error
          ? getBudgetErrorMessage(removeError.message)
          : getBudgetErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveCategoryBudget(category: BudgetCategory) {
    const nextAmount = Number(budgetDrafts[category.id] ?? category.budgetedAmount)

    if (!Number.isFinite(nextAmount) || nextAmount < 0) {
      setError('Budsjettbeløpet må være null eller positivt.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updateBudgetCategoryBudget(category.id, nextAmount)
      await reload(data.currentPeriod.id)
      setSuccess(`Oppdatert budsjett for ${category.name}.`)
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? getBudgetErrorMessage(updateError.message)
          : getBudgetErrorMessage()
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleImportCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await file.text()
      const next = await importBudgetCsv(text, data.currentPeriod.id)
      setData(next)
      setBudgetDrafts(
        Object.fromEntries(
          next.categories.map((category) => [category.id, String(category.budgetedAmount)])
        )
      )
      setSuccess(
        'CSV-importen er fullført. Kjente merchants blir automatisk koblet mot lagrede regler.'
      )
    } catch (importError) {
      const message =
        importError instanceof Error
          ? getBudgetErrorMessage(importError.message)
          : getBudgetErrorMessage()
      setError(message)
    } finally {
      event.target.value = ''
      setSaving(false)
    }
  }

  function downloadExport(filename: string, content: Blob | BlobPart, type?: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function handleExportJson() {
    downloadExport(
      `compoundiq-budget-${data.currentPeriod.monthStart}.json`,
      buildBudgetJsonExport(data),
      'application/json;charset=utf-8'
    )
  }

  function handleExportCsv() {
    const exportLang = resolveExportLanguage(lang, getStoredExportLanguage())
    downloadExport(
      `compoundiq-budget-${data.currentPeriod.monthStart}.csv`,
      buildBudgetCsvExport(data, exportLang),
      'text/csv;charset=utf-8'
    )
  }

  function handleExportXlsx() {
    const exportLang = resolveExportLanguage(lang, getStoredExportLanguage())
    downloadExport(
      `compoundiq-budget-${data.currentPeriod.monthStart}.xlsx`,
      buildBudgetXlsxExport(data, exportLang)
    )
  }

  function handleExportPdf() {
    const exportLang = resolveExportLanguage(lang, getStoredExportLanguage())
    const exportWindow = window.open('', '_blank', 'noopener,noreferrer')

    if (!exportWindow) {
      setError(
        lang === 'no'
          ? 'Nettleseren blokkerte PDF-vinduet. Tillat popup-vinduer og prøv igjen.'
          : 'The browser blocked the PDF window. Allow pop-ups and try again.'
      )
      return
    }

    exportWindow.document.open()
    exportWindow.document.write(buildBudgetPrintHtml(data, exportLang))
    exportWindow.document.close()
    exportWindow.focus()
    window.setTimeout(() => exportWindow.print(), 250)
  }

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Budsjett og kontantstrøm</h1>
          <p className="dash-subtitle">
            Følg plan mot faktisk per måned, importer kontoutskrifter og eksporter i flere
            formater.
          </p>
        </div>
        <div className="dash-actions budget-toolbar">
          <button type="button" className="btn btn-outline" onClick={handleExportCsv}>
            Eksporter CSV
          </button>
          <button type="button" className="btn btn-outline" onClick={handleExportXlsx}>
            Eksporter XLSX
          </button>
          <button type="button" className="btn btn-outline" onClick={handleExportPdf}>
            Eksporter PDF
          </button>
          <button type="button" className="btn btn-outline" onClick={handleExportJson}>
            Eksporter JSON
          </button>
          <label className="btn btn-primary budget-import-btn">
            Importer CSV
            <input type="file" accept=".csv,text/csv" onChange={handleImportCsv} hidden />
          </label>
        </div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="auth-success-inline">{success}</div> : null}

      <div className="dash-stats dash-stats-four">
        <MetricCard
          label="Inntekter"
          value={formatBudgetCurrency(summary.plannedIncome)}
          hint={`Faktisk ${formatBudgetCurrency(summary.totalIncome)}`}
        />
        <MetricCard
          label="Utgifter"
          value={formatBudgetCurrency(summary.plannedExpenses)}
          hint={`Faktisk ${formatBudgetCurrency(summary.totalExpenses)}`}
        />
        <MetricCard
          label="Sparing"
          value={formatBudgetCurrency(summary.plannedSavings)}
          hint={`Faktisk ${formatBudgetCurrency(summary.totalSavings)}`}
        />
        <MetricCard
          label="Netto igjen"
          value={formatBudgetCurrency(
            summary.plannedIncome - summary.plannedExpenses - summary.plannedSavings
          )}
          hint={`Faktisk ${formatBudgetCurrency(summary.netCashflow)}`}
          accent={
            summary.plannedIncome - summary.plannedExpenses - summary.plannedSavings >= 0
              ? 'positive'
              : 'negative'
          }
        />
      </div>

      <div className="dashboard-grid budget-grid-top">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Periode</h2>
          <div className="dashboard-form">
            <label>
              Aktiv periode
              <select
                value={data.currentPeriod.id}
                onChange={(event) => void handlePeriodChange(event.target.value)}
                disabled={loading || saving}
              >
                {data.periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Opprett eller åpne måned
              <input
                type="month"
                value={newPeriodMonth}
                onChange={(event) => setNewPeriodMonth(event.target.value)}
                disabled={loading || saving}
              />
            </label>
          </div>
          <div className="dash-actions budget-period-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleCreateSelectedPeriod()}
              disabled={saving || !newPeriodMonth}
            >
              Åpne valgt måned
            </button>
            {data.currentPeriod.monthStart !== `${getCurrentMonthValue()}-01` ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => void handleGoToCurrentMonth()}
                disabled={saving}
              >
                Gå til inneværende måned
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void handleCreateNextPeriod()}
              disabled={saving}
            >
              Opprett neste måned
            </button>
          </div>
          <p className="panel-copy budget-period-copy">
            Nye måneder bruker samme kategorioppsett og budsjettverdier som du allerede har satt
            opp, slik at du slipper å starte fra bunnen hver gang.
          </p>
          <p className="panel-copy budget-period-copy">
            Gratisplanen får én budsjettarbeidsflate med CSV/JSON-import og eksport til CSV, XLSX
            og PDF. Pro kan senere utvide til flere budsjetter, deling og dypere automatisering.
          </p>
          <div className="budget-plan-chip">Plan: {data.plan === 'free' ? 'Gratis' : 'Pro'}</div>
        </div>

        <div className="dashboard-panel">
          <h2 className="dash-section-title">Smarte signaler</h2>
          <div className="budget-insight-list">
            {insights.map((insight) => (
              <div key={insight.title} className={`budget-insight ${insight.tone}`}>
                <strong>{insight.title}</strong>
                <p className="panel-copy">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid budget-grid-main">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Kategoribudsjett</h2>
          <BudgetCategoryTable
            title="Utgifter"
            rows={expenseCategories}
            drafts={budgetDrafts}
            onDraftChange={setBudgetDrafts}
            onSave={(category) => void handleSaveCategoryBudget(category)}
            saving={saving}
          />
          <BudgetCategoryTable
            title="Sparing"
            rows={savingsCategories}
            drafts={budgetDrafts}
            onDraftChange={setBudgetDrafts}
            onSave={(category) => void handleSaveCategoryBudget(category)}
            saving={saving}
          />
          <BudgetCategoryTable
            title="Inntekter"
            rows={incomeCategories}
            drafts={budgetDrafts}
            onDraftChange={setBudgetDrafts}
            onSave={(category) => void handleSaveCategoryBudget(category)}
            saving={saving}
          />
        </div>

        <div className="dashboard-panel">
          <h2 className="dash-section-title">Ny transaksjon</h2>
          <form className="dashboard-form" onSubmit={handleTransactionSubmit}>
            <div className="dashboard-form-row">
              <label>
                Dato
                <input
                  type="date"
                  value={transactionForm.transactionDate}
                  onChange={(event) =>
                    setTransactionForm((current) => ({
                      ...current,
                      transactionDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Kategori
                <select
                  value={transactionForm.categoryId}
                  onChange={(event) =>
                    setTransactionForm((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                >
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Beskrivelse / merchant
              <input
                value={transactionForm.merchant}
                placeholder="Kiwi, Husleie, Lønn"
                onChange={(event) =>
                  setTransactionForm((current) => ({
                    ...current,
                    merchant: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Beløp
              <input
                type="number"
                min="0"
                step="0.01"
                value={transactionForm.amount}
                onChange={(event) =>
                  setTransactionForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Notat
              <input
                value={transactionForm.note}
                placeholder="Valgfritt notat"
                onChange={(event) =>
                  setTransactionForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Lagrer...' : 'Legg til transaksjon'}
            </button>
          </form>

          <div className="budget-helper-card">
            <strong>CSV-import</strong>
            <p className="panel-copy">
              Støttede kolonner: <code>date</code>, <code>merchant</code>, <code>amount</code>,{' '}
              <code>category</code>, <code>kind</code>, <code>note</code>.
            </p>
            <p className="panel-copy">
              Dersom du har brukt samme merchant tidligere, brukes lagrede regler automatisk.
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="dash-header-row">
          <h2 className="dash-section-title">Transaksjoner i {data.currentPeriod.label}</h2>
          <span className="budget-transaction-count">{data.transactions.length} registrert</span>
        </div>
        {data.transactions.length === 0 ? (
          <p className="panel-copy">
            Ingen transaksjoner registrert ennå. Legg inn manuelt eller importer en CSV for denne
            perioden.
          </p>
        ) : (
          <div className="budget-transaction-list">
            {data.transactions.map((transaction) => {
              const category = transaction.categoryId
                ? categoryMap.get(transaction.categoryId)
                : undefined

              return (
                <div key={transaction.id} className="budget-transaction-item">
                  <div className="budget-transaction-main">
                    <strong>{transaction.merchant}</strong>
                    <span className="panel-copy">
                      {transaction.transactionDate} · {category?.name ?? 'Uklassifisert'}
                    </span>
                  </div>
                  <div className="budget-transaction-meta">
                    <span className={`budget-kind-pill ${transaction.kind}`}>
                      {kindLabel(transaction.kind)}
                    </span>
                    <strong>{formatBudgetCurrency(transaction.amount)}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => void handleDeleteTransaction(transaction.id)}
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
  )
}

function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: 'positive' | 'negative'
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value stat-value-lg${accent ? ` metric-${accent}` : ''}`}>
        {value}
      </span>
      {hint ? <span className="stat-hint">{hint}</span> : null}
    </div>
  )
}

function BudgetCategoryTable({
  title,
  rows,
  drafts,
  onDraftChange,
  onSave,
  saving,
}: {
  title: string
  rows: ReturnType<typeof summarizeBudgetCategories>
  drafts: Record<string, string>
  onDraftChange: Dispatch<SetStateAction<Record<string, string>>>
  onSave: (category: BudgetCategory) => void
  saving: boolean
}) {
  if (rows.length === 0) {
    return null
  }

  return (
    <div className="budget-category-section">
      <div className="dash-header-row">
        <h3 className="budget-subtitle">{title}</h3>
      </div>
      <div className="budget-table">
        {rows.map((row) => (
          <div key={row.category.id} className="budget-table-row">
            <div className="budget-table-cell budget-table-cell-title">
              <strong>{row.category.name}</strong>
              <span className="panel-copy">
                Faktisk {formatBudgetCurrency(row.actualAmount)} · Igjen{' '}
                <span className={row.remainingAmount >= 0 ? 'metric-positive' : 'metric-negative'}>
                  {formatBudgetCurrency(row.remainingAmount)}
                </span>
              </span>
            </div>
            <div className="budget-table-cell budget-table-cell-input">
              <label className="budget-amount-field">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={drafts[row.category.id] ?? String(row.category.budgetedAmount)}
                  onChange={(event) =>
                    onDraftChange((current) => ({
                      ...current,
                      [row.category.id]: event.target.value,
                    }))
                  }
                />
                <span>kr</span>
              </label>
            </div>
            <div className="budget-table-cell budget-table-cell-meta">
              <span>{Math.round(row.utilizationPct)} % brukt</span>
            </div>
            <div className="budget-table-cell budget-table-cell-action">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onSave(row.category)}
                disabled={saving}
              >
                Lagre
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function kindLabel(kind: BudgetCategoryKind) {
  if (kind === 'income') {
    return 'Inntekt'
  }

  if (kind === 'savings') {
    return 'Sparing'
  }

  return 'Utgift'
}
