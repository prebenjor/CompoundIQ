'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SetupNotice from '@/components/SetupNotice'
import { hasPublicSupabaseEnv } from '@/lib/env'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const errorParam = searchParams.get('error')
  const authConfigured = hasPublicSupabaseEnv()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    getErrorMessage(errorParam)
  )
  const [success, setSuccess] = useState(false)

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    if (!authConfigured) {
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createBrowserSupabaseClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(getSupabaseErrorMessage(loginError.message))
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  async function handleMagicLink(event: React.FormEvent) {
    event.preventDefault()
    if (!authConfigured) {
      return
    }

    if (!email) {
      setError('Skriv inn e-postadressen din.')
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createBrowserSupabaseClient()
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (magicError) {
      setError(getSupabaseErrorMessage(magicError.message))
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

        <h1 className="auth-title">Logg inn</h1>
        <p className="auth-subtitle">Velkommen tilbake</p>

        {error ? <div className="auth-error">{error}</div> : null}

        {!authConfigured ? (
          <SetupNotice
            title="Supabase er ikke konfigurert"
            description="Auth er satt opp, men prosjektet mangler de offentlige Supabase-verdiene. Dashboardet fungerer fortsatt i demo mode."
            actionHref="/dashboard"
            actionLabel="Apne demo-dashboard"
          />
        ) : success ? (
          <div className="auth-success">
            <div className="auth-success-icon">Mail</div>
            <h3>Sjekk e-posten din</h3>
            <p>
              Vi sendte en innloggingslenke til <strong>{email}</strong>. Klikk pa lenken for
              a logge inn.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleLogin} className="auth-form">
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
                <label htmlFor="password">
                  Passord
                  <Link href="/auth/forgot-password" className="form-link">
                    Glemt passord?
                  </Link>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minst 8 tegn"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Logger inn...' : 'Logg inn'}
              </button>
            </form>

            <div className="auth-divider">
              <span>eller</span>
            </div>

            <button
              onClick={handleMagicLink}
              className="btn btn-ghost btn-full"
              disabled={loading}
            >
              Send innloggingslenke pa e-post
            </button>

            <p className="auth-footer-text">
              Har du ikke konto?{' '}
              <Link href="/auth/signup" className="auth-link">
                Opprett konto
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="auth-card" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

function getErrorMessage(errorParam: string | null) {
  if (!errorParam) {
    return null
  }

  if (errorParam === 'missing_config') {
    return 'Supabase mangler miljoverdier. Bruk demo-dashboardet eller legg inn konfigurasjon.'
  }

  if (errorParam === 'auth_callback_failed') {
    return 'Autentisering mislyktes. Prov igjen.'
  }

  return null
}

function getSupabaseErrorMessage(message: string) {
  if (message.includes('Invalid login credentials')) {
    return 'Feil e-post eller passord.'
  }

  if (message.includes('Email not confirmed')) {
    return 'Bekreft e-posten din forst.'
  }

  if (message.includes('rate limit')) {
    return 'For mange forsok. Prov igjen om litt.'
  }

  return 'Noe gikk galt. Prov igjen.'
}
