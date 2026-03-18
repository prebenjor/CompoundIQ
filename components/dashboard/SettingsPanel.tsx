'use client'

import { useState, useSyncExternalStore } from 'react'
import {
  defaultDashboardSettings,
  formatCurrency,
  loadDashboardSettings,
  saveDashboardSettings,
  subscribeDashboardStorage,
  type DashboardSettings,
} from '@/lib/dashboard-data'

export default function SettingsPanel() {
  const storedSettings = useSyncExternalStore<DashboardSettings>(
    subscribeDashboardStorage,
    loadDashboardSettings,
    () => defaultDashboardSettings
  )
  const [draft, setDraft] = useState<DashboardSettings>(
    defaultDashboardSettings
  )
  const [saved, setSaved] = useState(false)

  function updateSetting<K extends keyof DashboardSettings>(
    key: K,
    value: DashboardSettings[K]
  ) {
    setSaved(false)
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveDashboardSettings(draft)
    setSaved(true)
  }

  function resetDefaults() {
    setDraft(defaultDashboardSettings)
    saveDashboardSettings(defaultDashboardSettings)
    setSaved(true)
  }

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Innstillinger</h1>
          <p className="dash-subtitle">
            Disse verdiene brukes som standard i dashboardet og lagres lokalt.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Standardforutsetninger</h2>
          <form className="dashboard-form" onSubmit={handleSave}>
            <label>
              Månedlig sparing
              <input
                type="number"
                value={draft.monthlyContribution}
                onChange={(event) =>
                  updateSetting('monthlyContribution', Number(event.target.value))
                }
              />
            </label>
            <div className="dashboard-form-row">
              <label>
                Forventet årlig avkastning
                <input
                  type="number"
                  step="0.1"
                  value={draft.expectedReturn}
                  onChange={(event) =>
                    updateSetting('expectedReturn', Number(event.target.value))
                  }
                />
              </label>
              <label>
                Inflasjon
                <input
                  type="number"
                  step="0.1"
                  value={draft.inflation}
                  onChange={(event) =>
                    updateSetting('inflation', Number(event.target.value))
                  }
                />
              </label>
            </div>
            <div className="dash-actions">
              <button type="submit" className="btn btn-primary">
                Lagre innstillinger
              </button>
              <button type="button" className="btn btn-outline" onClick={resetDefaults}>
                Tilbakestill
              </button>
            </div>
            {saved ? (
              <p className="panel-copy">Lagret. Oversikten bruker de nye standardverdiene.</p>
            ) : null}
          </form>
        </div>

        <div className="dashboard-panel">
          <h2 className="dash-section-title">Aktive standarder</h2>
          <div className="insight-list">
            <div className="insight-card">
              <span className="stat-label">Månedlig sparing</span>
              <strong>{formatCurrency(storedSettings.monthlyContribution)}</strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">Forventet avkastning</span>
              <strong>{storedSettings.expectedReturn.toFixed(1).replace('.', ',')} %</strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">Inflasjon</span>
              <strong>{storedSettings.inflation.toFixed(1).replace('.', ',')} %</strong>
            </div>
          </div>
          <p className="panel-copy">
            Vil du aktivere ekte innlogging senere, kan du legge til Supabase-nøkler i
            miljøvariablene uten å miste lokal demo-data.
          </p>
        </div>
      </div>
    </div>
  )
}
