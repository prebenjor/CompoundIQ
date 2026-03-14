'use client'

import { useEffect, useRef } from 'react'
import { useLang } from '@/lib/i18n'

export default function HowItWorks() {
  const { t } = useLang()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const steps = sectionRef.current?.querySelectorAll('.step')
    if (!steps) return
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
    steps.forEach((step) => {
      step.classList.add('fade-in')
      observer.observe(step)
    })
    return () => observer.disconnect()
  }, [])

  const steps = [
    { n: 1, titleKey: 'step-1-title', descKey: 'step-1-desc' },
    { n: 2, titleKey: 'step-2-title', descKey: 'step-2-desc' },
    { n: 3, titleKey: 'step-3-title', descKey: 'step-3-desc' },
  ]

  return (
    <section className="how-it-works section" id="how" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">{t('how-tag')}</p>
          <h2 className="section-title">{t('how-title')}</h2>
        </div>
        <div className="steps">
          {steps.map((step, i) => (
            <>
              <div className="step" key={step.n}>
                <div className="step-number">{step.n}</div>
                <h3>{t(step.titleKey)}</h3>
                <p>{t(step.descKey)}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="step-arrow" key={`arrow-${i}`}>→</div>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  )
}
