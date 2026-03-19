'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  defaultDashboardSettings,
  fetchDashboardSettingsBundle,
  formatCurrency,
  getDataErrorMessage,
  saveAccountPreferences,
  saveDashboardSettings,
  type AccountPreferences,
  type DashboardSettings,
} from '@/lib/dashboard-data'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

interface MfaFactor {
  id: string
  factor_type: 'totp' | 'phone' | 'webauthn'
  status: 'verified' | 'unverified'
  friendly_name?: string
}

interface PendingTotpEnrollment {
  factorId: string
  qrCode: string
  secret: string
  uri: string
}

const preferenceFields: Array<{
  key: keyof AccountPreferences
  label: string
  description: string
}> = [
  {
    key: 'weeklyDigest',
    label: 'Ukentlig sammendrag',
    description: 'F\u00e5 varsler om portef\u00f8ljeutvikling og en kort oppsummering av uken.',
  },
  {
    key: 'taxReminders',
    label: 'Skattep\u00e5minnelser',
    description: 'Hold oversikt over frister som p\u00e5virker ASK, aksjer og rapportering.',
  },
  {
    key: 'productUpdates',
    label: 'Produktnyheter',
    description: 'F\u00e5 beskjed n\u00e5r nye integrasjoner, eksporttyper og analysefunksjoner lanseres.',
  },
  {
    key: 'securityAlerts',
    label: 'Sikkerhetsvarsler',
    description: 'F\u00e5 e-post ved passordendringer, nye innlogginger og MFA-endringer.',
  },
  {
    key: 'compactNumbers',
    label: 'Kompakte tall',
    description: 'Vis store bel\u00f8p i kortere format i dashboardet n\u00e5r denne visningen er i bruk.',
  },
]

export default function SettingsPanel({ userEmail }: { userEmail?: string }) {
  const [activeSettings, setActiveSettings] = useState<DashboardSettings>(
    defaultDashboardSettings
  )
  const [draft, setDraft] = useState<DashboardSettings>(defaultDashboardSettings)
  const [preferences, setPreferences] = useState<AccountPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [securityMessage, setSecurityMessage] = useState<string | null>(null)
  const [securityError, setSecurityError] = useState<string | null>(null)
  const [sendingReset, setSendingReset] = useState(false)
  const [signingOutOthers, setSigningOutOthers] = useState(false)
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [mfaMessage, setMfaMessage] = useState<string | null>(null)
  const [mfaFactors, setMfaFactors] = useState<MfaFactor[]>([])
  const [aalLevel, setAalLevel] = useState<string | null>(null)
  const [nextAalLevel, setNextAalLevel] = useState<string | null>(null)
  const [pendingTotp, setPendingTotp] = useState<PendingTotpEnrollment | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [mfaActionLoading, setMfaActionLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSettings() {
      setLoading(true)
      setDataError(null)

      try {
        const bundle = await fetchDashboardSettingsBundle()

        if (!active) {
          return
        }

        setActiveSettings(bundle.settings)
        setDraft(bundle.settings)
        setPreferences(bundle.preferences)
      } catch (error) {
        if (!active) {
          return
        }

        const message =
          error instanceof Error ? getDataErrorMessage(error.message) : getDataErrorMessage()
        setDataError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSettings()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!userEmail) {
      setMfaFactors([])
      setAalLevel(null)
      setNextAalLevel(null)
      return
    }

    let ignore = false

    async function loadMfaState() {
      const supabase = createBrowserSupabaseClient()
      setMfaLoading(true)
      setMfaError(null)

      const [factorsResult, aalResult] = await Promise.all([
        supabase.auth.mfa.listFactors(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ])

      if (ignore) {
        return
      }

      if (factorsResult.error) {
        setMfaError(getMfaErrorMessage(factorsResult.error.message))
      } else {
        setMfaFactors((factorsResult.data?.all ?? []) as MfaFactor[])
      }

      if (aalResult.error) {
        setMfaError(getMfaErrorMessage(aalResult.error.message))
      } else {
        setAalLevel(aalResult.data?.currentLevel ?? null)
        setNextAalLevel(aalResult.data?.nextLevel ?? null)
      }

      setMfaLoading(false)
    }

    void loadMfaState()

    return () => {
      ignore = true
    }
  }, [userEmail])

  const verifiedTotpFactor = useMemo(
    () =>
      mfaFactors.find(
        (factor) => factor.factor_type === 'totp' && factor.status === 'verified'
      ),
    [mfaFactors]
  )

  const hasPendingTotp = useMemo(
    () =>
      mfaFactors.some(
        (factor) => factor.factor_type === 'totp' && factor.status === 'unverified'
      ),
    [mfaFactors]
  )

  function updateSetting<K extends keyof DashboardSettings>(
    key: K,
    value: DashboardSettings[K]
  ) {
    setSettingsMessage(null)
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSettingsSaving(true)
    setDataError(null)
    setSettingsMessage(null)

    try {
      const bundle = await saveDashboardSettings(draft)
      setActiveSettings(bundle.settings)
      setDraft(bundle.settings)
      setPreferences(bundle.preferences)
      setSettingsMessage('Standardverdiene ble lagret for kontoen din.')
    } catch (error) {
      const message =
        error instanceof Error ? getDataErrorMessage(error.message) : getDataErrorMessage()
      setDataError(message)
    } finally {
      setSettingsSaving(false)
    }
  }

  async function resetDefaults() {
    setSettingsSaving(true)
    setDataError(null)
    setSettingsMessage(null)

    try {
      const bundle = await saveDashboardSettings(defaultDashboardSettings)
      setActiveSettings(bundle.settings)
      setDraft(bundle.settings)
      setPreferences(bundle.preferences)
      setSettingsMessage('Standardverdiene ble tilbakestilt.')
    } catch (error) {
      const message =
        error instanceof Error ? getDataErrorMessage(error.message) : getDataErrorMessage()
      setDataError(message)
    } finally {
      setSettingsSaving(false)
    }
  }

  async function togglePreference(key: keyof AccountPreferences) {
    if (!preferences) {
      return
    }

    const previous = preferences
    const next = { ...preferences, [key]: !preferences[key] }
    setPreferences(next)
    setPreferencesSaving(true)
    setPreferencesMessage(null)
    setDataError(null)

    try {
      const bundle = await saveAccountPreferences(next)
      setActiveSettings(bundle.settings)
      setDraft(bundle.settings)
      setPreferences(bundle.preferences)
      setPreferencesMessage('Preferansene ble oppdatert.')
    } catch (error) {
      setPreferences(previous)
      const message =
        error instanceof Error ? getDataErrorMessage(error.message) : getDataErrorMessage()
      setDataError(message)
    } finally {
      setPreferencesSaving(false)
    }
  }

  async function sendPasswordReset() {
    if (!userEmail) {
      return
    }

    const supabase = createBrowserSupabaseClient()
    setSendingReset(true)
    setSecurityError(null)
    setSecurityMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      setSecurityError(getAuthErrorMessage(error.message))
    } else {
      setSecurityMessage(
        'Vi sendte en lenke for tilbakestilling av passord til e-postadressen på kontoen.'
      )
    }

    setSendingReset(false)
  }

  async function signOutOtherSessions() {
    const supabase = createBrowserSupabaseClient()
    setSigningOutOthers(true)
    setSecurityError(null)
    setSecurityMessage(null)

    const { error } = await supabase.auth.signOut({ scope: 'others' })

    if (error) {
      setSecurityError(getAuthErrorMessage(error.message))
    } else {
      setSecurityMessage('Andre aktive økter ble logget ut.')
    }

    setSigningOutOthers(false)
  }

  async function refreshMfaState() {
    const supabase = createBrowserSupabaseClient()
    const [factorsResult, aalResult] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ])

    setMfaFactors((factorsResult.data?.all ?? []) as MfaFactor[])
    setAalLevel(aalResult.data?.currentLevel ?? null)
    setNextAalLevel(aalResult.data?.nextLevel ?? null)
  }

  async function startTotpEnrollment() {
    const supabase = createBrowserSupabaseClient()
    setMfaActionLoading(true)
    setMfaError(null)
    setMfaMessage(null)

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'CompoundIQ Authenticator',
    })

    if (error || !data) {
      setMfaError(getMfaErrorMessage(error?.message))
      setMfaActionLoading(false)
      return
    }

    setPendingTotp({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    })
    setMfaMessage('Skann QR-koden og bekreft med den 6-sifrede koden fra appen din.')
    setMfaActionLoading(false)
  }

  async function copyMfaValue(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value)
      setMfaMessage(successMessage)
      setMfaError(null)
    } catch {
      setMfaError('Kunne ikke kopiere automatisk. Kopier verdien manuelt.')
    }
  }

  async function verifyTotpEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pendingTotp) {
      return
    }

    const supabase = createBrowserSupabaseClient()
    setMfaActionLoading(true)
    setMfaError(null)

    const challenge = await supabase.auth.mfa.challenge({
      factorId: pendingTotp.factorId,
    })

    if (challenge.error || !challenge.data) {
      setMfaError(getMfaErrorMessage(challenge.error?.message))
      setMfaActionLoading(false)
      return
    }

    const verification = await supabase.auth.mfa.verify({
      factorId: pendingTotp.factorId,
      challengeId: challenge.data.id,
      code: totpCode,
    })

    if (verification.error) {
      setMfaError(getMfaErrorMessage(verification.error.message))
      setMfaActionLoading(false)
      return
    }

    setPendingTotp(null)
    setTotpCode('')
    setMfaMessage('Tofaktorautentisering er aktivert. Fremtidige innlogginger kan kreve ekstra kode.')
    await refreshMfaState()
    setMfaActionLoading(false)
  }

  async function disableTotp(factorId: string) {
    const supabase = createBrowserSupabaseClient()
    setMfaActionLoading(true)
    setMfaError(null)
    setMfaMessage(null)

    const { error } = await supabase.auth.mfa.unenroll({ factorId })

    if (error) {
      setMfaError(getMfaErrorMessage(error.message))
      setMfaActionLoading(false)
      return
    }

    setPendingTotp(null)
    setTotpCode('')
    setMfaMessage('Tofaktorautentisering ble deaktivert for kontoen.')
    await refreshMfaState()
    setMfaActionLoading(false)
  }

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Innstillinger og konto</h1>
          <p className="dash-subtitle">
            Styr standardforutsetninger, preferanser og sikkerhet fra ett sted.
          </p>
        </div>
      </div>

      {dataError ? <div className="auth-error">{dataError}</div> : null}

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Standardforutsetninger</h2>
          {loading ? (
            <p className="panel-copy">Laster innstillingene dine...</p>
          ) : (
            <form className="dashboard-form" onSubmit={handleSave}>
              <label>
                {'Månedlig sparing'}
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
                  {'Forventet årlig avkastning'}
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
                <button type="submit" className="btn btn-primary" disabled={settingsSaving}>
                  {settingsSaving ? 'Lagrer...' : 'Lagre innstillinger'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void resetDefaults()}
                  disabled={settingsSaving}
                >
                  Tilbakestill
                </button>
              </div>
              {settingsMessage ? <p className="panel-copy">{settingsMessage}</p> : null}
            </form>
          )}
        </div>

        <div className="dashboard-panel">
          <h2 className="dash-section-title">Aktive standarder</h2>
          <div className="insight-list">
            <div className="insight-card">
              <span className="stat-label">{'Månedlig sparing'}</span>
              <strong>{formatCurrency(activeSettings.monthlyContribution)}</strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">Forventet avkastning</span>
              <strong>{activeSettings.expectedReturn.toFixed(1).replace('.', ',')} %</strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">Inflasjon</span>
              <strong>{activeSettings.inflation.toFixed(1).replace('.', ',')} %</strong>
            </div>
          </div>
          <p className="panel-copy">
            Disse standardverdiene brukes i kalkulatorer og porteføljevisninger for kontoen din.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Preferanser</h2>
          {loading || !preferences ? (
            <p className="panel-copy">Laster preferansene dine...</p>
          ) : (
            <>
              <div className="settings-toggle-list">
                {preferenceFields.map((field) => (
                  <button
                    key={field.key}
                    type="button"
                    className="settings-toggle-card"
                    onClick={() => void togglePreference(field.key)}
                    disabled={preferencesSaving}
                  >
                    <div>
                      <strong className="settings-toggle-title">{field.label}</strong>
                      <p className="panel-copy">{field.description}</p>
                    </div>
                    <span
                      className={`settings-toggle-switch${
                        preferences[field.key] ? ' active' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <span className="settings-toggle-knob" />
                    </span>
                  </button>
                ))}
              </div>
              {preferencesMessage ? <p className="panel-copy">{preferencesMessage}</p> : null}
            </>
          )}
        </div>

        <div className="dashboard-panel">
          <h2 className="dash-section-title">Konto</h2>
          <div className="insight-list">
            <div className="insight-card">
              <span className="stat-label">Status</span>
              <strong>Innlogget med Supabase Auth</strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">E-post</span>
              <strong>{userEmail ?? 'Ukjent bruker'}</strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">{'Autentiseringsnivå'}</span>
              <strong>{formatAalLabel(aalLevel, nextAalLevel)}</strong>
            </div>
          </div>
          <p className="panel-copy">
            {'Bruk sikkerhetsdelen under for tilbakestilling av passord, MFA og håndtering av aktive økter.'}
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Sikkerhet</h2>
          {securityError ? <div className="auth-error">{securityError}</div> : null}
          {securityMessage ? <div className="auth-success-inline">{securityMessage}</div> : null}
          <div className="settings-action-list">
            <div className="settings-action-card">
              <div>
                <strong className="settings-toggle-title">Tilbakestilling av passord</strong>
                <p className="panel-copy">
                  {'Send en sikker lenke til e-posten på kontoen for å sette nytt passord.'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => void sendPasswordReset()}
                disabled={!userEmail || sendingReset}
              >
                {sendingReset ? 'Sender...' : 'Send passordlenke'}
              </button>
            </div>

            <div className="settings-action-card">
              <div>
                <strong className="settings-toggle-title">{'Andre aktive økter'}</strong>
                <p className="panel-copy">
                  {'Logg ut andre nettlesere og enheter dersom du vil rydde opp i aktive økter.'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void signOutOtherSessions()}
                disabled={signingOutOthers}
              >
                {signingOutOthers ? 'Logger ut...' : 'Logg ut andre enheter'}
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <h2 className="dash-section-title">Tofaktorautentisering</h2>
          {mfaError ? <div className="auth-error">{mfaError}</div> : null}
          {mfaMessage ? <div className="auth-success-inline">{mfaMessage}</div> : null}

          <div className="insight-list">
            <div className="insight-card">
              <span className="stat-label">MFA-status</span>
              <strong>
                {verifiedTotpFactor
                  ? `Aktiv (${verifiedTotpFactor.friendly_name ?? 'TOTP'})`
                  : hasPendingTotp || pendingTotp
                    ? 'Venter på bekreftelse'
                    : 'Ikke aktiv'}
              </strong>
            </div>
            <div className="insight-card">
              <span className="stat-label">AAL</span>
              <strong>{formatAalLabel(aalLevel, nextAalLevel)}</strong>
            </div>
          </div>

          {pendingTotp ? (
            <div className="mfa-setup-card">
              <p className="panel-copy">
                Skann QR-koden i Google Authenticator, 1Password eller tilsvarende app.
              </p>
              <div
                className="mfa-qr"
                role="img"
                aria-label="QR-kode for TOTP-oppsett"
                dangerouslySetInnerHTML={{ __html: normalizeTotpQrSvg(pendingTotp.qrCode) }}
              />
              <div className="dash-actions">
                <a href={pendingTotp.uri} className="btn btn-outline">
                  {'Åpne i autentiseringsapp'}
                </a>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    void copyMfaValue(
                      pendingTotp.uri,
                      'Oppsettslenken ble kopiert. Lim den inn i autentiseringsappen hvis QR-koden ikke vises.'
                    )
                  }
                >
                  Kopier oppsettslenke
                </button>
              </div>
              <label className="dashboard-form">
                <span className="settings-inline-label">Manuell hemmelighet</span>
                <input value={pendingTotp.secret} readOnly />
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  void copyMfaValue(
                    pendingTotp.secret,
                    'Den manuelle hemmeligheten ble kopiert.'
                  )
                }
              >
                Kopier hemmelighet
              </button>
              <form className="dashboard-form" onSubmit={verifyTotpEnrollment}>
                <label>
                  Bekreft kode
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="123456"
                    value={totpCode}
                    onChange={(event) =>
                      setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    required
                  />
                </label>
                <div className="dash-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={mfaActionLoading}
                  >
                    {mfaActionLoading ? 'Bekrefter...' : 'Aktiver MFA'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setPendingTotp(null)
                      setTotpCode('')
                      setMfaMessage(null)
                    }}
                  >
                    Avbryt
                  </button>
                </div>
              </form>
            </div>
          ) : verifiedTotpFactor ? (
            <div className="settings-action-card">
              <div>
                <strong className="settings-toggle-title">Aktiv TOTP</strong>
                <p className="panel-copy">
                  {'Du må normalt bekrefte identiteten din på nytt for å deaktivere en verifisert faktor.'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => void disableTotp(verifiedTotpFactor.id)}
                disabled={mfaActionLoading || mfaLoading}
              >
                {mfaActionLoading ? 'Oppdaterer...' : 'Deaktiver MFA'}
              </button>
            </div>
          ) : (
            <div className="settings-action-card">
              <div>
                <strong className="settings-toggle-title">Aktiver TOTP</strong>
                <p className="panel-copy">
                  {'Legg til en autentiseringsapp for å beskytte kontoen med ekstra kode ved innlogging.'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void startTotpEnrollment()}
                disabled={mfaActionLoading || mfaLoading}
              >
                {mfaActionLoading ? 'Starter...' : 'Sett opp MFA'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatAalLabel(currentLevel: string | null, nextLevel: string | null) {
  if (!currentLevel) {
    return 'Ukjent'
  }

  if (currentLevel === 'aal2') {
    return 'Høyt sikkerhetsnivå (passord og tofaktor)'
  }

  if (nextLevel === 'aal2') {
    return 'Standard sikkerhetsnivå. Du kan aktivere tofaktor under.'
  }

  return 'Standard sikkerhetsnivå'
}

function getAuthErrorMessage(message?: string) {
  if (!message) {
    return 'Noe gikk galt. Prøv igjen.'
  }

  if (message.includes('rate limit')) {
    return 'For mange forsøk. Prøv igjen om litt.'
  }

  if (message.includes('session')) {
    return 'Økten din er ikke gyldig lenger. Logg inn på nytt og prøv igjen.'
  }

  return 'Noe gikk galt. Prøv igjen.'
}

function getMfaErrorMessage(message?: string) {
  if (!message) {
    return 'Kunne ikke oppdatere tofaktorautentisering.'
  }

  if (message.includes('AAL2')) {
    return 'Du må bekrefte identiteten din på nytt før du kan fjerne denne faktoren.'
  }

  if (message.includes('code')) {
    return 'Koden ble ikke godkjent. Sjekk autentiseringsappen og prøv igjen.'
  }

  return 'Kunne ikke oppdatere tofaktorautentisering.'
}

function normalizeTotpQrSvg(qrCode: string) {
  const trimmed = qrCode.trim()

  if (!trimmed.startsWith('<svg')) {
    return '<div class="panel-copy">QR-koden kunne ikke vises. Bruk oppsettslenken eller den manuelle hemmeligheten under.</div>'
  }

  let svg = trimmed

  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  if (!svg.includes('viewBox') && svg.includes('width=') && svg.includes('height=')) {
    const widthMatch = svg.match(/width="([^"]+)"/)
    const heightMatch = svg.match(/height="([^"]+)"/)

    if (widthMatch && heightMatch) {
      svg = svg.replace('<svg', `<svg viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`)
    }
  }

  return svg
}
