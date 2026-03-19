'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'no' | 'en'

type Translations = Record<string, string>

const translations: Record<Lang, Translations> = {
  no: {
    'page-title': 'CompoundIQ - Se hva pengene dine faktisk vokser til',
    'nav-features': 'Funksjoner',
    'nav-calculator': 'Kalkulator',
    'nav-pricing': 'Priser',
    'nav-login': 'Logg inn',
    'nav-get-started': 'Bli med på ventelisten',
    'hero-badge': 'Norske skatteregler innebygd',
    'hero-title-line1': 'Se hva pengene dine',
    'hero-title-line2': 'faktisk vokser til',
    'hero-subtitle':
      'CompoundIQ hjelper deg å modellere investeringsvekst med norske skatteregler, ASK, BSU og inflasjon i samme verktøy.',
    'hero-cta-primary': 'Prøv kalkulatoren',
    'hero-cta-secondary': 'Se hvordan det fungerer',
    'highlight-1': 'ASK og BSU',
    'highlight-2': 'Norsk skattemodell',
    'highlight-3': 'Scenarioer',
    'features-tag': 'Funksjoner',
    'features-title': 'Forstå norsk sparing og investering',
    'features-subtitle':
      'Kalkulatorer og scenarioverktøy tilpasset norske skatteregler, uten finansiell rådgivning.',
    'feat-nordnet-title': 'Renterente-kalkulator',
    'feat-nordnet-icon': 'Vekst',
    'feat-nordnet-desc':
      'Juster startbeløp, sparing, avkastning og tidshorisont, og se effekten umiddelbart.',
    'feat-nordnet-tag': 'Gratis å bruke',
    'feat-oslobors-title': 'Skatteeffekt',
    'feat-oslobors-icon': 'Skatt',
    'feat-oslobors-desc':
      'Se hvordan skatt, inflasjon og tid på markedet påvirker den reelle avkastningen.',
    'feat-ask-title': 'ASK og BSU-planlegging',
    'feat-ask-icon': 'ASK',
    'feat-ask-desc':
      'Sammenlign ASK, BSU og skattepliktig sparing med en modell som er enkel å justere.',
    'feat-news-title': 'Kontosammenligning',
    'feat-news-icon': 'Konto',
    'feat-news-desc':
      'Sammenlign ulike kontotyper side ved side og se hvilket oppsett som passer deg best.',
    'feat-calc-title': 'Scenarioverktøy',
    'feat-calc-icon': 'Plan',
    'feat-calc-desc':
      'Test hva som skjer hvis du sparer mer, endrer avkastning eller justerer inflasjonen.',
    'feat-scenario-title': 'Lagre og eksporter',
    'feat-scenario-icon': 'Lagre',
    'feat-scenario-desc':
      'Neste steg er lagring, eksport og integrasjoner. Dashboardet viser allerede retningen.',
    'calc-tag': 'Kalkulator',
    'calc-title': 'Se pengene dine vokse',
    'calc-subtitle':
      'Bruk kalkulatoren til å projisere investeringsvekst med norske standardforutsetninger.',
    'calc-account-label': 'Kontotype',
    'calc-account-ask': 'ASK',
    'calc-account-vanlig': 'Fond/aksjer',
    'calc-account-bank': 'Bankkonto',
    'calc-tax-note-ask': '37,84 % skatt på gevinst ved uttak.',
    'calc-tax-note-vanlig': '37,84 % effektiv skatt på avkastning i forenklet modell.',
    'calc-tax-note-bank': '22 % skatt på renteinntekter.',
    'calc-principal-label': 'Startinvestering',
    'calc-monthly-label': 'Månedlig sparing',
    'calc-rate-label': 'Forventet årsavkastning',
    'calc-years-label': 'Tidshorisont',
    'calc-inflation-label': 'Forventet inflasjon',
    'calc-contrib-growth-label': 'Årlig økning i sparing',
    'calc-pretax-label': 'Saldo i ASK',
    'calc-aftertax-label': 'Etter skatt ved uttak',
    'calc-final-label': 'Sluttsaldo',
    'calc-real-label': 'Realverdi',
    'calc-multiplier-label': 'Multiplikator',
    'calc-contrib-label': 'Totale innskudd',
    'calc-interest-label': 'Netto avkastning',
    'calc-withdrawal-label': 'Bærekraftig uttak (4 %)',
    'calc-per-month': '/mnd',
    'calc-legend-balance': 'Saldo',
    'calc-legend-real': 'Realverdi',
    'calc-legend-contrib': 'Innskudd',
    'calc-show-table': 'Vis årsfordeling',
    'calc-hide-table': 'Skjul årsfordeling',
    'calc-table-year': 'År',
    'calc-table-balance': 'Saldo',
    'calc-table-contrib': 'Innskudd',
    'calc-table-return': 'Avkastning',
    'calc-table-real': 'Realverdi',
    'calc-ask-note':
      'ASK-beregningen viser saldo i kontoen og etter-skatt-estimat ved uttak.',
    'calc-vanlig-note':
      'Avkastning utenfor ASK modelleres med en forenklet effektiv skattesats.',
    'years-suffix': 'år',
    'chart-year-label': 'År',
    'how-tag': 'Slik fungerer det',
    'how-title': 'Kom i gang på 3 steg',
    'step-1-title': 'Opprett konto',
    'step-1-desc': 'Registrer deg gratis og logg inn for a bygge portefoljen din.',
    'step-2-title': 'Legg inn tallene dine',
    'step-2-desc': 'Fyll inn sparing, tid og avkastning, eller legg inn portefølje manuelt.',
    'step-3-title': 'Test scenarioer',
    'step-3-desc': 'Juster forutsetninger og se hva de betyr over tid.',
    'pricing-tag': 'Priser',
    'pricing-title': 'Enkel og transparent prising',
    'pricing-subtitle': 'Gratis skal være genuint nyttig. Pro skal koste lite og spare deg mer tid.',
    'plan-free-name': 'Gratis',
    'plan-free-price': '0',
    'plan-free-period': '/mnd',
    'plan-free-desc': 'Én budsjettflate, men sterk nok til faktisk bruk',
    'plan-free-f1': 'Kalkulator for ASK, fond/aksjer og bankkonto',
    'plan-free-f2': 'ASK/BSU-planner og skattejustert modell',
    'plan-free-f3': 'Inflasjon hentet fra SSB',
    'plan-free-f4': 'Realverdi, multiplikator og bærekraftig uttak',
    'plan-free-f5': 'Årsfordeling, graf og scenario-sammenligning',
    'plan-free-f6': 'Import av CSV/JSON og eksport til CSV, XLSX og PDF for én budsjettflate',
    'plan-free-f7': 'Lagre flere scenarioer lokalt i nettleseren',
    'plan-free-f8': 'Ingen kredittkort nødvendig',
    'plan-free-cta': 'Start gratis',
    'plan-pro-name': 'Pro',
    'plan-pro-badge': 'Kommer snart',
    'plan-pro-price': '29',
    'plan-pro-period': '/mnd',
    'plan-pro-desc': 'Billig nok til å være et enkelt ja, bred nok til å føles som et steg opp',
    'plan-pro-f1': 'Alt i Gratis',
    'plan-pro-f2': 'Synk mellom enheter',
    'plan-pro-f3': 'Ubegrensede porteføljer, scenarioer og versjoner',
    'plan-pro-f4': 'Bedre CSV-import, delbare lenker og sterkere eksportflyt',
    'plan-pro-f5': 'Eksport til PDF, CSV, JSON, XLSX og delbare lenker',
    'plan-pro-f6': 'Målsporing, varsler og månedlige innsikter',
    'plan-pro-f7': 'Husstandsdeling og samarbeid på porteføljer',
    'plan-pro-f8': 'Prioritert tilgang til åpne data-innsikter og analyser',
    'plan-pro-cta': 'Bli med på Pro-listen',
    'cta-title': 'Forstå hva pengene dine faktisk vokser til',
    'cta-desc': 'Vær blant de første som prøver CompoundIQ.',
    'cta-btn': 'Bli med på ventelisten',
    'waitlist-placeholder': 'Din e-postadresse',
    'waitlist-btn': 'Bli med',
    'waitlist-loading': 'Sender...',
    'waitlist-success': 'Takk! Du er på listen.',
    'waitlist-duplicate': 'Du er allerede på listen.',
    'waitlist-error': 'Noe gikk galt. Prøv igjen.',
    'waitlist-consent':
      'Ved å melde deg på godtar du at vi lagrer e-postadressen din for å varsle deg om lanseringen. Se vår <a href="/personvern">personvernerklæring</a>.',
    'footer-desc':
      'Kalkulatorer og scenarioverktøy for norske investorer, med ASK, BSU og skatteregler innebygd.',
    'footer-disclaimer':
      'CompoundIQ tilbyr ikke finansiell rådgivning. Alt innhold er kun ment som informasjon.',
    'footer-product': 'Produkt',
    'footer-features-link': 'Funksjoner',
    'footer-calculator-link': 'Kalkulator',
    'footer-pricing-link': 'Priser',
    'footer-company': 'Selskap',
    'footer-about': 'Om oss',
    'footer-blog': 'Blogg',
    'footer-careers': 'Karriere',
    'footer-legal': 'Juridisk',
    'footer-privacy': 'Personvern',
    'footer-terms': 'Vilkår',
    'footer-cookies': 'Informasjonskapsler',
    'footer-copyright': '(c) 2026 CompoundIQ. Alle rettigheter forbeholdt.',
    'cookie-title': 'Vi bruker informasjonskapsler',
    'cookie-desc':
      'Vi bruker localStorage for å huske språkvalg og samtykke. Ingen sporingskapsler er aktivert nå.',
    'cookie-policy-link': 'Les mer',
    'cookie-necessary': 'Kun nødvendige',
    'cookie-accept-all': 'Godta alle',
  },
  en: {
    'page-title': 'CompoundIQ - See what your money actually grows to',
    'nav-features': 'Features',
    'nav-calculator': 'Calculator',
    'nav-pricing': 'Pricing',
    'nav-login': 'Log In',
    'nav-get-started': 'Join the Waitlist',
    'hero-badge': 'Norwegian tax rules built in',
    'hero-title-line1': 'See what your money',
    'hero-title-line2': 'actually grows to',
    'hero-subtitle':
      'CompoundIQ helps you model investment growth with Norwegian tax rules, ASK, BSU and inflation in one place.',
    'hero-cta-primary': 'Try the calculator',
    'hero-cta-secondary': 'See how it works',
    'highlight-1': 'ASK and BSU',
    'highlight-2': 'Tax model',
    'highlight-3': 'Scenarios',
    'features-tag': 'Features',
    'features-title': 'Understand Norwegian saving and investing',
    'features-subtitle':
      'Calculators and planning tools built around Norwegian tax rules without pretending to be financial advice.',
    'feat-nordnet-title': 'Compound interest calculator',
    'feat-nordnet-icon': 'Grow',
    'feat-nordnet-desc':
      'Adjust starting amount, savings rate, return and time horizon, then see the effect immediately.',
    'feat-nordnet-tag': 'Free to use',
    'feat-oslobors-title': 'Tax impact',
    'feat-oslobors-icon': 'Tax',
    'feat-oslobors-desc':
      'See how taxes, inflation and time in the market shape your real return.',
    'feat-ask-title': 'ASK and BSU planning',
    'feat-ask-icon': 'ASK',
    'feat-ask-desc':
      'Compare ASK, BSU and taxable investing with a model you can adjust yourself.',
    'feat-news-title': 'Account comparison',
    'feat-news-icon': 'Mix',
    'feat-news-desc':
      'Compare different account types side by side and see which setup fits you best.',
    'feat-calc-title': 'Scenario tools',
    'feat-calc-icon': 'Plan',
    'feat-calc-desc':
      'Test what happens if you save more, change expected return or raise inflation.',
    'feat-scenario-title': 'Save and export',
    'feat-scenario-icon': 'Save',
    'feat-scenario-desc':
      'The roadmap includes saved scenarios, exports and integrations, and the dashboard already points there.',
    'calc-tag': 'Calculator',
    'calc-title': 'See your money grow',
    'calc-subtitle':
      'Use the calculator to project long-term investing outcomes with Norwegian default assumptions.',
    'calc-account-label': 'Account type',
    'calc-account-ask': 'ASK',
    'calc-account-vanlig': 'Stocks/Funds',
    'calc-account-bank': 'Bank account',
    'calc-tax-note-ask': '37.84% tax on gains at withdrawal.',
    'calc-tax-note-vanlig': '37.84% effective tax drag in the simplified model.',
    'calc-tax-note-bank': '22% tax on interest income.',
    'calc-principal-label': 'Starting investment',
    'calc-monthly-label': 'Monthly savings',
    'calc-rate-label': 'Expected annual return',
    'calc-years-label': 'Time horizon',
    'calc-inflation-label': 'Expected inflation',
    'calc-contrib-growth-label': 'Annual savings increase',
    'calc-pretax-label': 'Balance in ASK',
    'calc-aftertax-label': 'After withdrawal tax',
    'calc-final-label': 'Final balance',
    'calc-real-label': 'Real value',
    'calc-multiplier-label': 'Multiplier',
    'calc-contrib-label': 'Total contributions',
    'calc-interest-label': 'Net return',
    'calc-withdrawal-label': 'Sustainable withdrawal (4%)',
    'calc-per-month': '/month',
    'calc-legend-balance': 'Balance',
    'calc-legend-real': 'Real value',
    'calc-legend-contrib': 'Contributions',
    'calc-show-table': 'Show yearly breakdown',
    'calc-hide-table': 'Hide yearly breakdown',
    'calc-table-year': 'Year',
    'calc-table-balance': 'Balance',
    'calc-table-contrib': 'Contributions',
    'calc-table-return': 'Return',
    'calc-table-real': 'Real value',
    'calc-ask-note':
      'The ASK model shows both account balance and a simple after-tax estimate at withdrawal.',
    'calc-vanlig-note':
      'Returns outside ASK are modeled with a simplified effective tax drag.',
    'years-suffix': 'yrs',
    'chart-year-label': 'Yr',
    'how-tag': 'How it works',
    'how-title': 'Get started in 3 steps',
    'step-1-title': 'Create your account',
    'step-1-desc': 'Sign up for free and log in to build your portfolio.',
    'step-2-title': 'Enter your numbers',
    'step-2-desc': 'Add savings assumptions or build a manual portfolio.',
    'step-3-title': 'Test scenarios',
    'step-3-desc': 'Adjust assumptions and see what they mean over time.',
    'pricing-tag': 'Pricing',
    'pricing-title': 'Simple, transparent pricing',
    'pricing-subtitle': 'Free should be genuinely useful. Pro should be cheaper and save meaningful time.',
    'plan-free-name': 'Free',
    'plan-free-price': '0',
    'plan-free-period': '/mo',
    'plan-free-desc': 'One budget workspace, but useful enough to stand on its own',
    'plan-free-f1': 'ASK, stocks/funds and bank account calculator',
    'plan-free-f2': 'ASK/BSU planner and tax-adjusted modeling',
    'plan-free-f3': 'Inflation fetched from SSB',
    'plan-free-f4': 'Real value, multiplier and withdrawal estimate',
    'plan-free-f5': 'Yearly breakdown, chart and scenario comparison',
    'plan-free-f6': 'CSV/JSON imports and CSV, XLSX and PDF exports for one budget workspace',
    'plan-free-f7': 'Save multiple scenarios locally in the browser',
    'plan-free-f8': 'No credit card required',
    'plan-free-cta': 'Start free',
    'plan-pro-name': 'Pro',
    'plan-pro-badge': 'Coming soon',
    'plan-pro-price': '29',
    'plan-pro-period': '/mo',
    'plan-pro-desc': 'Cheap enough to be an easy upgrade, broad enough to feel clearly better',
    'plan-pro-f1': 'Everything in Free',
    'plan-pro-f2': 'Sync across devices',
    'plan-pro-f3': 'Unlimited portfolios, scenarios and versions',
    'plan-pro-f4': 'Stronger CSV imports, shareable links and a better export flow',
    'plan-pro-f5': 'Exports for PDF, CSV, JSON, XLSX and shareable links',
    'plan-pro-f6': 'Goal tracking, alerts and monthly insights',
    'plan-pro-f7': 'Household sharing and portfolio collaboration',
    'plan-pro-f8': 'Priority access to open-data insights and analysis features',
    'plan-pro-cta': 'Join the Pro waitlist',
    'cta-title': 'Understand what your money actually grows to',
    'cta-desc': 'Be among the first people to try CompoundIQ.',
    'cta-btn': 'Join the waitlist',
    'waitlist-placeholder': 'Your email address',
    'waitlist-btn': 'Join',
    'waitlist-loading': 'Submitting...',
    'waitlist-success': "Thanks. You're on the list.",
    'waitlist-duplicate': "You're already on the list.",
    'waitlist-error': 'Something went wrong. Please try again.',
    'waitlist-consent':
      'By signing up, you agree that we can store your email to notify you about launch updates. See our <a href="/personvern">privacy policy</a>.',
    'footer-desc':
      'Calculators and planning tools for Norwegian investors with ASK, BSU and tax rules built in.',
    'footer-disclaimer':
      'CompoundIQ does not provide financial advice. All content is informational only.',
    'footer-product': 'Product',
    'footer-features-link': 'Features',
    'footer-calculator-link': 'Calculator',
    'footer-pricing-link': 'Pricing',
    'footer-company': 'Company',
    'footer-about': 'About',
    'footer-blog': 'Blog',
    'footer-careers': 'Careers',
    'footer-legal': 'Legal',
    'footer-privacy': 'Privacy',
    'footer-terms': 'Terms',
    'footer-cookies': 'Cookies',
    'footer-copyright': '(c) 2026 CompoundIQ. All rights reserved.',
    'cookie-title': 'We use cookies',
    'cookie-desc':
      'We use localStorage to remember language preference and consent. No tracking cookies are enabled right now.',
    'cookie-policy-link': 'Learn more',
    'cookie-necessary': 'Necessary only',
    'cookie-accept-all': 'Accept all',
  },
}

interface LangContextValue {
  lang: Lang
  t: (key: string) => string
  toggleLang: () => void
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'no',
  t: (key) => key,
  toggleLang: () => {},
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') {
      return 'no'
    }

    const stored = localStorage.getItem('ciq-lang') as Lang
    return stored === 'no' || stored === 'en' ? stored : 'no'
  })

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = translations[lang]['page-title']
  }, [lang])

  const setPreferredLang = (next: Lang) => {
    setLang(next)
    localStorage.setItem('ciq-lang', next)
  }

  const toggleLang = () => {
    const next: Lang = lang === 'no' ? 'en' : 'no'
    setPreferredLang(next)
  }

  const t = (key: string) => translations[lang][key] ?? key

  return (
    <LangContext.Provider value={{ lang, t, toggleLang, setLang: setPreferredLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
