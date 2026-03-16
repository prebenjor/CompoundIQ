'use client'

import { useEffect, useRef } from 'react'
import { useLang } from '@/lib/i18n'

export default function Pricing() {
  const { t } = useLang()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.pricing-card')
    if (!cards) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    cards.forEach((card) => {
      card.classList.add('fade-in')
      observer.observe(card)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <section className="pricing section" id="pricing" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">{t('pricing-tag')}</p>
          <h2 className="section-title">{t('pricing-title')}</h2>
          <p className="section-subtitle">{t('pricing-subtitle')}</p>
        </div>
        <div className="pricing-grid">

          {/* Free */}
          <div className="pricing-card">
            <div className="plan-name">{t('plan-free-name')}</div>
            <div className="plan-price">
              <span>{t('plan-free-price')}</span>
              <span className="plan-currency"> kr</span>
              <span className="plan-period">{t('plan-free-period')}</span>
            </div>
            <p className="plan-desc">{t('plan-free-desc')}</p>
            <ul className="plan-features">
              {['f1','f2','f3','f4','f5','f6'].map((f) => (
                <li key={f}>✓ <span>{t(`plan-free-${f}`)}</span></li>
              ))}
            </ul>
            <a href="#waitlist" className="btn btn-outline btn-full">{t('plan-free-cta')}</a>
          </div>

          {/* Pro */}
          <div className="pricing-card pricing-card-featured">
            <div className="plan-badge">{t('plan-pro-badge')}</div>
            <div className="plan-name">{t('plan-pro-name')}</div>
            <div className="plan-price">
              <span>{t('plan-pro-price')}</span>
              <span className="plan-currency"> kr</span>
              <span className="plan-period">{t('plan-pro-period')}</span>
            </div>
            <p className="plan-desc">{t('plan-pro-desc')}</p>
            <ul className="plan-features">
              {['f1','f2','f3','f4','f5','f6'].map((f) => (
                <li key={f}>✓ <span>{t(`plan-pro-${f}`)}</span></li>
              ))}
            </ul>
            <a href="#waitlist" className="btn btn-primary btn-full">{t('plan-pro-cta')}</a>
          </div>

        </div>
      </div>
    </section>
  )
}
