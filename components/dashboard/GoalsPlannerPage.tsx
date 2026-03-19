'use client'

import { useEffect, useState } from 'react'
import GoalsPlanner from '@/components/dashboard/GoalsPlanner'
import { type BudgetSavingsThread } from '@/lib/budget-data'
import {
  fetchGoalDashboardData,
  getGoalErrorMessage,
  type UserGoal,
} from '@/lib/goals-data'

export default function GoalsPlannerPage() {
  const [goals, setGoals] = useState<UserGoal[] | null>(null)
  const [budgetThread, setBudgetThread] = useState<BudgetSavingsThread | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      setError(null)

      try {
        const next = await fetchGoalDashboardData()

        if (!active) {
          return
        }

        setGoals(next.goals)
        setBudgetThread(next.budgetThread)
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error ? getGoalErrorMessage(loadError.message) : getGoalErrorMessage()
        setError(message)
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [])

  if (error) {
    return (
      <div className="dash-page">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Mål og fremdrift</h1>
            <p className="dash-subtitle">
              Kunne ikke laste målmotoren. Sjekk at SQL-skjemaet er oppdatert i Supabase.
            </p>
          </div>
        </div>
        <div className="auth-error">{error}</div>
      </div>
    )
  }

  if (!goals) {
    return (
      <div className="dash-page">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Mål og fremdrift</h1>
            <p className="dash-subtitle">Laster mål, fremdrift og anbefalt sparefart...</p>
          </div>
        </div>
      </div>
    )
  }

  return <GoalsPlanner initialGoals={goals} budgetThread={budgetThread} />
}
