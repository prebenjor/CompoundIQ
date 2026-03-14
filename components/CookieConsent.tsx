'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/lib/i18n'

const COOKIE_KEY = 'ciq-cookie-consent'

export default function CookieConsent() {
  const { t } = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(COOKIE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const accept = (value: 'all' | 'necessary') => {
    localStorage.setItem(COOKIE_KEY, value)
    setVisible(false)
  }

  return (
    <div
      className={`cookie-banner${visible ? ' visible' : ''}`}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="cookie-content">
        <div className="cookie-text">
          <p className="cookie-title">{t('cookie-title')}</p>
          <p>
            {t('cookie-desc')}{' '}
            <a href="#">{t('cookie-policy-link')}</a>
          </p>
        </div>
        <div className="cookie-actions">
          <button className="btn btn-outline" onClick={() => accept('necessary')}>
            {t('cookie-necessary')}
          </button>
          <button className="btn btn-primary" onClick={() => accept('all')}>
            {t('cookie-accept-all')}
          </button>
        </div>
      </div>
    </div>
  )
}
