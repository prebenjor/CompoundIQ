'use client'

import { useEffect, useRef } from 'react'
import { useLang } from '@/lib/i18n'

export default function Features() {
  const { t } = useLang()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.feature-card')
    if (!cards) {
      return
    }

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
      iconKey: 'feat-nordnet-icon',
      titleKey: 'feat-nordnet-title',
      descKey: 'feat-nordnet-desc',
      tagKey: 'feat-nordnet-tag',
    },
    { iconKey: 'feat-oslobors-icon', titleKey: 'feat-oslobors-title', descKey: 'feat-oslobors-desc' },
    { iconKey: 'feat-ask-icon', titleKey: 'feat-ask-title', descKey: 'feat-ask-desc' },
    { iconKey: 'feat-news-icon', titleKey: 'feat-news-title', descKey: 'feat-news-desc' },
    { iconKey: 'feat-calc-icon', titleKey: 'feat-calc-title', descKey: 'feat-calc-desc' },
    { iconKey: 'feat-scenario-icon', titleKey: 'feat-scenario-title', descKey: 'feat-scenario-desc' },
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
          {features.map((feature) => (
            <div key={feature.titleKey} className="feature-card">
              <div className="feature-icon">{t(feature.iconKey)}</div>
              <h3>{t(feature.titleKey)}</h3>
              <p>{t(feature.descKey)}</p>
              {feature.tagKey ? <div className="feature-tag">{t(feature.tagKey)}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
