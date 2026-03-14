'use client'

import { useLang } from '@/lib/i18n'
import WaitlistForm from './WaitlistForm'

export default function CtaSection() {
  const { t } = useLang()

  return (
    <section className="cta-section section" id="waitlist">
      <div className="container">
        <div className="cta-card">
          <div className="hero-orb cta-orb-1" />
          <div className="hero-orb cta-orb-2" />
          <h2>{t('cta-title')}</h2>
          <p>{t('cta-desc')}</p>
          <WaitlistForm />
        </div>
      </div>
    </section>
  )
}
