'use client'

import { useMemo, useState } from 'react'
import {
  deriveGoalSummaries,
  getGoalErrorMessage,
  updateUserGoal,
  type GoalSummary,
  type UserGoal,
} from '@/lib/goals-data'
import { formatBudgetCurrency, type BudgetSavingsThread } from '@/lib/budget-data'

export default function GoalsPlanner({
  initialGoals,
  budgetThread,
}: {
  initialGoals: UserGoal[]
  budgetThread: BudgetSavingsThread | null
}) {
  const [goals, setGoals] = useState(initialGoals)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const summaries = useMemo(() => deriveGoalSummaries(goals, budgetThread), [goals, budgetThread])

  async function saveGoal(goalId: string, updates: Partial<UserGoal>) {
    setSavingId(goalId)
    setError(null)
    setSuccess(null)

    try {
      const updated = await updateUserGoal(goalId, updates)
      setGoals((current) =>
        current
          .map((goal) => (goal.id === goalId ? updated : goal))
          .sort((left, right) => left.priority - right.priority)
      )
      setSuccess(`Målet «${updated.title}» ble oppdatert.`)
    } catch (saveError) {
      const message =
        saveError instanceof Error ? getGoalErrorMessage(saveError.message) : getGoalErrorMessage()
      setError(message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Mål og fremdrift</h1>
          <p className="dash-subtitle">
            Prioriter målene dine og la ledig overskudd flyte automatisk til det som er viktigst nå.
          </p>
        </div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="auth-success-inline">{success}</div> : null}

      <div className="dashboard-panel">
        <p className="panel-copy">
          Dedikert kapasitet kommer fra fordelingen din i budsjettet. Fritt overskudd fordeles
          automatisk etter prioritet, slik at høyest prioriterte aktive mål får ekstra fart først.
        </p>
      </div>

      <div className="dash-stats dash-stats-two">
        {summaries.map((summary) => (
          <GoalProgressCard key={summary.goal.id} summary={summary} />
        ))}
      </div>

      <div className="dashboard-grid goals-grid">
        {summaries.map((summary) => (
          <GoalEditorCard
            key={summary.goal.id}
            summary={summary}
            saving={savingId === summary.goal.id}
            onSave={saveGoal}
          />
        ))}
      </div>
    </div>
  )
}

function GoalProgressCard({ summary }: { summary: GoalSummary }) {
  return (
    <div className={`stat-card goal-progress-card goal-progress-card-${summary.tone}`}>
      <span className="stat-label">{summary.goal.title}</span>
      <span className="stat-value stat-value-lg">{Math.round(summary.progressPct)} %</span>
      <span className="stat-hint">
        {formatBudgetCurrency(summary.goal.currentAmount)} av {formatBudgetCurrency(summary.goal.targetAmount)}
      </span>
      <span className="stat-hint">
        Prioritet {summary.goal.priority} · {formatBudgetCurrency(summary.recommendedMonthly)} per måned
      </span>
    </div>
  )
}

function GoalEditorCard({
  summary,
  saving,
  onSave,
}: {
  summary: GoalSummary
  saving: boolean
  onSave: (goalId: string, updates: Partial<UserGoal>) => Promise<void>
}) {
  const [draft, setDraft] = useState(() => ({
    title: summary.goal.title,
    targetAmount: String(summary.goal.targetAmount),
    currentAmount: String(summary.goal.currentAmount),
    targetDate: summary.goal.targetDate ?? '',
    status: summary.goal.status,
    priority: String(summary.goal.priority),
  }))

  return (
    <div className="dashboard-panel goal-editor-card">
      <div className="dash-header-row">
        <h2 className="dash-section-title">
          {summary.goal.type === 'emergency_fund' ? 'Nødbuffer' : 'BSU-årsmål'}
        </h2>
        <span className={`control-room-pill control-room-pill-${summary.tone}`}>
          {summary.isOnTrack ? 'På sporet' : 'Krever justering'}
        </span>
      </div>

      <form
        className="dashboard-form"
        onSubmit={(event) => {
          event.preventDefault()
          void onSave(summary.goal.id, {
            title: draft.title.trim(),
            targetAmount: Number(draft.targetAmount),
            currentAmount: Number(draft.currentAmount),
            targetDate: draft.targetDate || null,
            status: draft.status,
            priority: Number(draft.priority),
          })
        }}
      >
        <label>
          Tittel
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          />
        </label>

        <div className="dashboard-form-row">
          <label>
            Målbeløp
            <input
              type="number"
              min="0"
              step="100"
              value={draft.targetAmount}
              onChange={(event) =>
                setDraft((current) => ({ ...current, targetAmount: event.target.value }))
              }
            />
          </label>
          <label>
            Nåværende beløp
            <input
              type="number"
              min="0"
              step="100"
              value={draft.currentAmount}
              onChange={(event) =>
                setDraft((current) => ({ ...current, currentAmount: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="dashboard-form-row">
          <label>
            Måldato
            <input
              type="date"
              value={draft.targetDate}
              onChange={(event) =>
                setDraft((current) => ({ ...current, targetDate: event.target.value }))
              }
            />
          </label>
          <label>
            Prioritet
            <input
              type="number"
              min="1"
              step="1"
              value={draft.priority}
              onChange={(event) =>
                setDraft((current) => ({ ...current, priority: event.target.value }))
              }
            />
          </label>
        </div>

        <p className="panel-copy">Lavt tall betyr høyere prioritet. Fritt overskudd går til laveste tall først.</p>

        <div className="dashboard-form-row">
          <label>
            Status
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as UserGoal['status'],
                }))
              }
            >
              <option value="active">Aktiv</option>
              <option value="paused">Pauset</option>
              <option value="completed">Fullført</option>
            </select>
          </label>
        </div>

        <div className="goal-editor-summary">
          <div className="insight-card">
            <span className="stat-label">Igjen</span>
            <strong>{formatBudgetCurrency(summary.remainingAmount)}</strong>
          </div>
          <div className="insight-card">
            <span className="stat-label">Dedikert per måned</span>
            <strong>{formatBudgetCurrency(summary.dedicatedMonthly)}</strong>
          </div>
          <div className="insight-card">
            <span className="stat-label">Fritt overskudd hit</span>
            <strong>{formatBudgetCurrency(summary.flexibleMonthly)}</strong>
          </div>
          <div className="insight-card">
            <span className="stat-label">Total anbefaling</span>
            <strong>{formatBudgetCurrency(summary.recommendedMonthly)}</strong>
          </div>
          <div className="insight-card">
            <span className="stat-label">Prognose</span>
            <strong>{summary.projectedDateLabel ?? 'Mangler fart'}</strong>
          </div>
        </div>

        <p className="panel-copy">{summary.guidance}</p>

        <div className="dash-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Lagrer...' : 'Lagre mål'}
          </button>
        </div>
      </form>
    </div>
  )
}
