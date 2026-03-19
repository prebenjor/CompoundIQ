'use client'

import Link from 'next/link'
import { useState } from 'react'
import SetupNotice from '@/components/SetupNotice'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

const authConfigured = hasPublicSupabaseEnv()

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!authConfigured) {
      return
    }

    setError(null)
    setLoading(true)

    const supabase = createBrowserSupabaseClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (resetError) {
      setError('Noe gikk galt. Sjekk at e-postadressen er riktig og prov igjen.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <span className="logo-icon">▲</span>
          CompoundIQ
        </Link>

        <h1 className="auth-title">Glemt passord?</h1>
        <p className="auth-subtitle">Vi sender deg en lenke for a tilbakestille passordet.</p>

        {!authConfigured ? (
          <SetupNotice
            title="Supabase er ikke konfigurert"
            description="Legg inn NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY for a aktivere passordreset."
            actionHref="/auth/login"
            actionLabel="Tilbake til innlogging"
          />
        ) : (
          <>
            {error ? <div className="auth-error">{error}</div> : null}

            {sent ? (
              <div className="auth-success">
                <div className="auth-success-icon">Mail</div>
                <h3>Sjekk e-posten din</h3>
                <p>
                  Vi sendte en tilbakestillingslenke til <strong>{email}</strong>. Lenken er
                  gyldig i 60 minutter.
                </p>
                <Link
                  href="/auth/login"
                  className="btn btn-primary"
                  style={{ marginTop: '16px', display: 'inline-flex' }}
                >
                  Tilbake til innlogging
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email">E-postadresse</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="deg@eksempel.no"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : 'Send tilbakestillingslenke'}
                  </button>
                </form>

                <p className="auth-footer-text">
                  Husker du passordet?{' '}
                  <Link href="/auth/login" className="auth-link">
                    Logg inn
                  </Link>
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
