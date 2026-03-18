'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import SetupNotice from '@/components/SetupNotice'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const authConfigured = hasPublicSupabaseEnv()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!authConfigured) {
      return
    }

    setError(null)

    if (password !== confirmPassword) {
      setError('Passordene stemmer ikke overens.')
      return
    }

    if (password.length < 8) {
      setError('Passordet må være minst 8 tegn.')
      return
    }

    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Kunne ikke oppdatere passordet. Lenken kan ha utløpt. Be om en ny.')
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <span className="logo-icon">▲</span>
          CompoundIQ
        </Link>

        <h1 className="auth-title">Nytt passord</h1>
        <p className="auth-subtitle">Velg et nytt passord for kontoen din.</p>

        {!authConfigured ? (
          <SetupNotice
            title="Supabase er ikke konfigurert"
            description="Legg inn de offentlige Supabase-verdiene for å bruke passordreset."
            actionHref="/auth/login"
            actionLabel="Tilbake til innlogging"
          />
        ) : (
          <>
            {error ? <div className="auth-error">{error}</div> : null}

            {done ? (
              <div className="auth-success">
                <div className="auth-success-icon">✓</div>
                <h3>Passord oppdatert</h3>
                <p>Du blir nå sendt videre til dashboardet.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="password">Nytt passord</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Minst 8 tegn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm">Bekreft nytt passord</label>
                  <input
                    id="confirm"
                    type="password"
                    placeholder="Gjenta passord"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : 'Oppdater passord'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
