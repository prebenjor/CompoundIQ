'use client'

import { useEffect, useState } from 'react'
import BudgetPlanner from '@/components/dashboard/BudgetPlanner'
import {
  fetchBudgetDashboardData,
  getBudgetErrorMessage,
  type BudgetDashboardData,
} from '@/lib/budget-data'

export default function BudgetPlannerPage() {
  const [data, setData] = useState<BudgetDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      setError(null)

      try {
        const next = await fetchBudgetDashboardData()

        if (!active) {
          return
        }

        setData(next)
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error
            ? getBudgetErrorMessage(loadError.message)
            : getBudgetErrorMessage()
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
            <h1 className="dash-title">Budsjett og kontantstrom</h1>
            <p className="dash-subtitle">
              Kunne ikke laste budsjettmodulen. Sjekk at SQL-skjemaet er oppdatert i Supabase.
            </p>
          </div>
        </div>
        <div className="auth-error">{error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="dash-page">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Budsjett og kontantstrom</h1>
            <p className="dash-subtitle">Laster budsjett, perioder og kategorier...</p>
          </div>
        </div>
      </div>
    )
  }

  return <BudgetPlanner initialData={data} />
}
