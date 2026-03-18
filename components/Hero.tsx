'use client'

import { useLang } from '@/lib/i18n'

export default function Hero() {
  const { t } = useLang()

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>
      <div className="container hero-inner">
        <div className="hero-badge">
          <span className="badge-dot" />
          <span>{t('hero-badge')}</span>
        </div>
        <h1 className="hero-title">
          <span>{t('hero-title-line1')}</span>
          <br />
          <span className="gradient-text">{t('hero-title-line2')}</span>
        </h1>
        <p className="hero-subtitle">{t('hero-subtitle')}</p>
        <div className="hero-actions">
          <a href="#calculator" className="btn btn-primary btn-lg">
            {t('hero-cta-primary')}
          </a>
          <a href="#features" className="btn btn-outline btn-lg">
            {t('hero-cta-secondary')}
          </a>
        </div>
        <div className="hero-highlights">
          <div className="highlight-item">
            <span className="highlight-icon">ASK</span>
            <span>{t('highlight-1')}</span>
          </div>
          <div className="highlight-divider" />
          <div className="highlight-item">
            <span className="highlight-icon">Tax</span>
            <span>{t('highlight-2')}</span>
          </div>
          <div className="highlight-divider" />
          <div className="highlight-item">
            <span className="highlight-icon">Plan</span>
            <span>{t('highlight-3')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
