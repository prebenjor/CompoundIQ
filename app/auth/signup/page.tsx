'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserSupabaseClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passordene stemmer ikke overens.')
      return
    }
    if (password.length < 8) {
      setError('Passordet må være minst 8 tegn.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
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

        <h1 className="auth-title">Opprett konto</h1>
        <p className="auth-subtitle">Kom i gang gratis</p>

        {error && <div className="auth-error">{error}</div>}

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✉</div>
            <h3>Bekreft e-posten din</h3>
            <p>
              Vi sendte en bekreftelseslenke til <strong>{email}</strong>.
              Klikk på lenken for å aktivere kontoen din.
            </p>
            <Link href="/auth/login" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Opprett konto'}
              </button>
            </form>

            <p className="auth-footer-text">
              Har du allerede konto?{' '}
              <Link href="/auth/login" className="auth-link">Logg inn</Link>
            </p>

            <p className="auth-terms-text">
              Ved å opprette konto godtar du{' '}
              <Link href="/vilkar" className="auth-link">vilkårene</Link> og{' '}
              <Link href="/personvern" className="auth-link">personvernerklæringen</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function getErrorMessage(msg: string): string {
  if (msg.includes('already registered')) return 'Denne e-postadressen er allerede registrert.'
  if (msg.includes('Password should be')) return 'Passordet er for svakt.'
  if (msg.includes('rate limit')) return 'For mange forsøk. Prøv igjen om litt.'
  return 'Noe gikk galt. Prøv igjen.'
}
