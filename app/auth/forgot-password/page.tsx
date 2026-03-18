'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const supabase = createBrowserSupabaseClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      setError('Noe gikk galt. Sjekk at e-postadressen er riktig og prøv igjen.')
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <span className="logo-icon">▲</span>
          CompoundIQ
        </Link>

        <h1 className="auth-title">Glemt passord?</h1>
        <p className="auth-subtitle">Vi sender deg en lenke for å tilbakestille passordet</p>

        {error && <div className="auth-error">{error}</div>}

        {sent ? (
          <div className="auth-success">
            <div className="auth-success-icon">✉</div>
            <h3>Sjekk e-posten din</h3>
            <p>
              Vi sendte en tilbakestillingslenke til <strong>{email}</strong>.
              Lenken er gyldig i 60 minutter.
            </p>
            <Link href="/auth/login" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
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
                  onChange={(e) => setEmail(e.target.value)}
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
              <Link href="/auth/login" className="auth-link">Logg inn</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
