'use client'

import Link from 'next/link'
import { useState } from 'react'
import SetupNotice from '@/components/SetupNotice'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function SignupPage() {
  const authConfigured = hasPublicSupabaseEnv()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault()
    if (!authConfigured) {
      return
    }

    setError(null)

    if (password !== confirm) {
      setError('Passordene stemmer ikke overens.')
      return
    }

    if (password.length < 8) {
      setError('Passordet ma vare minst 8 tegn.')
      return
    }

    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (signupError) {
      setError(getErrorMessage(signupError.message))
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <span className="logo-icon">▲</span>
          CompoundIQ
        </Link>

        <h1 className="auth-title">Opprett konto</h1>
        <p className="auth-subtitle">Kom i gang gratis</p>

        {error ? <div className="auth-error">{error}</div> : null}

        {!authConfigured ? (
          <SetupNotice
            title="Supabase er ikke konfigurert"
            description="Du kan fortsatt bruke dashboardet i demo mode, men ekte innlogging krever offentlige Supabase-verdier."
            actionHref="/dashboard"
            actionLabel="Apne demo-dashboard"
          />
        ) : success ? (
          <div className="auth-success">
            <div className="auth-success-icon">Mail</div>
            <h3>Bekreft e-posten din</h3>
            <p>
              Vi sendte en bekreftelseslenke til <strong>{email}</strong>. Klikk pa lenken for
              a aktivere kontoen din.
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
            <form onSubmit={handleSignup} className="auth-form">
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
              <div className="form-group">
                <label htmlFor="password">Passord</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minst 8 tegn"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm">Bekreft passord</label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="Gjenta passord"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Oppretter...' : 'Opprett konto'}
              </button>
            </form>

            <p className="auth-footer-text">
              Har du allerede konto?{' '}
              <Link href="/auth/login" className="auth-link">
                Logg inn
              </Link>
            </p>

            <p className="auth-terms-text">
              Ved a opprette konto godtar du{' '}
              <Link href="/vilkar" className="auth-link">
                vilkarene
              </Link>{' '}
              og{' '}
              <Link href="/personvern" className="auth-link">
                personvernerklaringen
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function getErrorMessage(message: string) {
  if (message.includes('already registered')) {
    return 'Denne e-postadressen er allerede registrert.'
  }

  if (message.includes('Password should be')) {
    return 'Passordet er for svakt.'
  }

  if (message.includes('rate limit')) {
    return 'For mange forsok. Prov igjen om litt.'
  }

  return 'Noe gikk galt. Prov igjen.'
}
