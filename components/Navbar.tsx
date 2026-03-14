'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/lib/i18n'

export default function Navbar() {
  const { lang, t, toggleLang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="container nav-inner">
          <a href="#" className="logo">
            <span className="logo-icon">▲</span>
            CompoundIQ
          </a>
          <ul className="nav-links">
            <li><a href="#features">{t('nav-features')}</a></li>
            <li><a href="#calculator">{t('nav-calculator')}</a></li>
            <li><a href="#pricing">{t('nav-pricing')}</a></li>
          </ul>
          <div className="nav-cta">
            <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language">
              <span className={`lang-option${lang === 'no' ? ' active' : ''}`}>NO</span>
              <span className="lang-sep">|</span>
              <span className={`lang-option${lang === 'en' ? ' active' : ''}`}>EN</span>
            </button>
            <a href="#" className="btn btn-ghost">{t('nav-login')}</a>
            <a href="#waitlist" className="btn btn-primary">{t('nav-get-started')}</a>
          </div>
          <button
            className="hamburger"
            id="hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobileMenu">
        <ul>
          <li><a href="#features" onClick={closeMenu}>{t('nav-features')}</a></li>
          <li><a href="#calculator" onClick={closeMenu}>{t('nav-calculator')}</a></li>
          <li><a href="#pricing" onClick={closeMenu}>{t('nav-pricing')}</a></li>
          <li>
            <button className="lang-toggle lang-toggle-mobile" onClick={toggleLang} aria-label="Toggle language">
              <span className={`lang-option${lang === 'no' ? ' active' : ''}`}>NO</span>
              <span className="lang-sep">|</span>
              <span className={`lang-option${lang === 'en' ? ' active' : ''}`}>EN</span>
            </button>
          </li>
          <li>
            <a href="#waitlist" className="btn btn-primary btn-full" onClick={closeMenu}>
              {t('nav-get-started')}
            </a>
          </li>
        </ul>
      </div>
    </>
  )
}
