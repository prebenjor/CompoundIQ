'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const supabase = createBrowserSupabaseClient()

  async function handleSubmit(e: React.FormEvent) {
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

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Kunne ikke oppdatere passordet. Lenken kan ha utløpt — be om en ny.')
      setLoading(false)
    } else {
      setDone(true)
      setLoading(false)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <span className="logo-icon">▲</span>
          CompoundIQ
        </Link>

        <h1 className="auth-title">Nytt passord</h1>
        <p className="auth-subtitle">Velg et nytt passord for kontoen din</p>

        {error && <div className="auth-error">{error}</div>}

        {done ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h3>Passord oppdatert!</h3>
            <p>Du blir nå sendt videre til dashbordet...</p>
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
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Oppdater passord'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
