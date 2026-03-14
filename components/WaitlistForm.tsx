'use client'

import { useState, FormEvent } from 'react'
import { useLang } from '@/lib/i18n'

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

export default function WaitlistForm() {
  const { lang, t } = useLang()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language: lang }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus(data.duplicate ? 'duplicate' : 'success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="waitlist-message success">{t('waitlist-success')}</p>
    )
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit}>
      <input
        className="waitlist-input"
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle') }}
        placeholder={t('waitlist-placeholder')}
        disabled={status === 'loading'}
        aria-label={t('waitlist-placeholder')}
      />
      <button
        className="btn btn-white btn-lg"
        type="submit"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? t('waitlist-loading') : t('waitlist-btn')}
      </button>
      {status === 'duplicate' && (
        <p className="waitlist-message duplicate">{t('waitlist-duplicate')}</p>
      )}
      {status === 'error' && (
        <p className="waitlist-message error">{t('waitlist-error')}</p>
      )}
    </form>
  )
}
