'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(errorParam ? 'Autentisering mislyktes. Prøv igjen.' : null)
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserSupabaseClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(getErrorMessage(error.message))
      setLoading(false)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Skriv inn e-postadressen din.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })

    if (error) {
      setError(getErrorMessage(error.message))
      setLoading(false)
    } else {
      setSuccess(true)
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

        <h1 className="auth-title">Logg inn</h1>
        <p className="auth-subtitle">Velkommen tilbake</p>

        {error && <div className="auth-error">{error}</div>}

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✉</div>
            <h3>Sjekk e-posten din</h3>
            <p>Vi sendte en innloggingslenke til <strong>{email}</strong>. Klikk på lenken for å logge inn.</p>
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  Passord
                  <Link href="/auth/forgot-password" className="form-link">Glemt passord?</Link>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Logg inn'}
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
              Send innloggingslenke på e-post
            </button>

            <p className="auth-footer-text">
              Har du ikke konto?{' '}
              <Link href="/auth/signup" className="auth-link">Opprett konto</Link>
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

function getErrorMessage(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Feil e-post eller passord.'
  if (msg.includes('Email not confirmed')) return 'Bekreft e-posten din først.'
  if (msg.includes('rate limit')) return 'For mange forsøk. Prøv igjen om litt.'
  return 'Noe gikk galt. Prøv igjen.'
}
