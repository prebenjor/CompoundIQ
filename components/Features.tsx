'use client'

import { useEffect, useRef } from 'react'
import { useLang } from '@/lib/i18n'

export default function Features() {
  const { t } = useLang()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.feature-card')
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

  const features = [
    {
      icon: '📈',
      titleKey: 'feat-nordnet-title',
      descKey: 'feat-nordnet-desc',
      tagKey: 'feat-nordnet-tag',
      large: true,
    },
    { icon: '🧾', titleKey: 'feat-oslobors-title', descKey: 'feat-oslobors-desc' },
    { icon: '🏦', titleKey: 'feat-ask-title',      descKey: 'feat-ask-desc' },
    { icon: '⚖️', titleKey: 'feat-news-title',     descKey: 'feat-news-desc' },
    { icon: '🎲', titleKey: 'feat-calc-title',     descKey: 'feat-calc-desc' },
    { icon: '📥', titleKey: 'feat-scenario-title', descKey: 'feat-scenario-desc' },
  ]

  return (
    <section className="features section" id="features" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">{t('features-tag')}</p>
          <h2 className="section-title">{t('features-title')}</h2>
          <p className="section-subtitle">{t('features-subtitle')}</p>
        </div>
        <div className="features-grid">
          {features.map((feat) => (
            <div
              key={feat.titleKey}
              className={`feature-card${feat.large ? ' feature-card-large' : ''}`}
            >
              <div className="feature-icon">{feat.icon}</div>
              <h3>{t(feat.titleKey)}</h3>
              <p>{t(feat.descKey)}</p>
              {feat.tagKey && (
                <div className="feature-tag">{t(feat.tagKey)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
