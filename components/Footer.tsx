'use client'

import { useLang } from '@/lib/i18n'

export default function Footer() {
  const { t } = useLang()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="#" className="logo">
            <span className="logo-icon">▲</span>
            CompoundIQ
          </a>
          <p>{t('footer-desc')}</p>
          <p className="footer-disclaimer">{t('footer-disclaimer')}</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>{t('footer-product')}</h4>
            <ul>
              <li><a href="#features">{t('footer-features-link')}</a></li>
              <li><a href="#calculator">{t('footer-calculator-link')}</a></li>
              <li><a href="#pricing">{t('footer-pricing-link')}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t('footer-company')}</h4>
            <ul>
              <li><a href="#">{t('footer-about')}</a></li>
              <li><a href="#">{t('footer-blog')}</a></li>
              <li><a href="#">{t('footer-careers')}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t('footer-legal')}</h4>
            <ul>
              <li><a href="#">{t('footer-privacy')}</a></li>
              <li><a href="#">{t('footer-terms')}</a></li>
              <li><a href="#">{t('footer-cookies')}</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>{t('footer-copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
