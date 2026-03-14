/* ===========================
   CompoundIQ — Main Scripts
   =========================== */

// === Translations ===
const translations = {
  no: {
    'page-title':            'CompoundIQ — Invester smartere i det norske markedet',
    'nav-features':          'Funksjoner',
    'nav-calculator':        'Kalkulator',
    'nav-pricing':           'Priser',
    'nav-login':             'Logg inn',
    'nav-get-started':       'Kom i gang gratis',
    'hero-badge':            'Bygget for det norske markedet',
    'hero-title-line1':      'Invester smartere',
    'hero-title-line2':      'i Norge',
    'hero-subtitle':         'CompoundIQ gir deg kraftige verktøy for å visualisere og optimere investeringene dine — med integrasjoner mot Nordnet, Oslo Børs og norske finansnyheter.',
    'hero-cta-primary':      'Prøv kalkulatoren',
    'hero-cta-secondary':    'Se hvordan det fungerer',
    'highlight-1':           'Oslo Børs & OBX',
    'highlight-2':           'Nordnet-integrasjon',
    'highlight-3':           'ASK & BSU-optimering',
    'features-tag':          'Funksjoner',
    'features-title':        'Alt du trenger for å vokse formuen din',
    'features-subtitle':     'Fra enkle kalkulatorer til avansert porteføljeanalyse — tilpasset det norske markedet.',
    'feat-nordnet-title':    'Nordnet-integrasjon',
    'feat-nordnet-desc':     'Koble til Nordnet og importer porteføljen din automatisk. Se alle aksjer og fond samlet på ett sted.',
    'feat-nordnet-tag':      'Mest populær',
    'feat-oslobors-title':   'Oslo Børs & OBX',
    'feat-oslobors-desc':    'Følg Oslo Børs med kursdata og indeksoppdateringer for norske aksjer og fond.',
    'feat-ask-title':        'ASK & BSU-optimering',
    'feat-ask-desc':         'Maksimer skattefordelene dine med vår kalkulator for Aksjesparekonto og BSU.',
    'feat-news-title':       'Norsk markedsinnsikt',
    'feat-news-desc':        'Ukentlige sammendrag og trender fra det norske aksjemarkedet og finanspressen.',
    'feat-calc-title':       'Rentesammensetningskalkulator',
    'feat-calc-desc':        'Visualiser veksten i investeringene dine over tid med vår interaktive kalkulator.',
    'feat-scenario-title':   'Scenariomodellering',
    'feat-scenario-desc':    'Kjør "hva hvis"-scenarioer — ekstra innskudd, ulike renter, markedsfall.',
    'calc-tag':              'Kalkulator',
    'calc-title':            'Se pengene dine vokse',
    'calc-subtitle':         'Bruk vår gratis rentesammensetningskalkulator for å projisere investeringsveksten din.',
    'calc-principal-label':  'Startinvestering',
    'calc-monthly-label':    'Månedlig sparing',
    'calc-rate-label':       'Årlig rente',
    'calc-years-label':      'Tidsperiode',
    'calc-freq-label':       'Rentefrekvens',
    'calc-final-label':      'Sluttsaldo',
    'calc-contrib-label':    'Totale innskudd',
    'calc-interest-label':   'Opptjente renter',
    'calc-legend-balance':   'Saldo',
    'calc-legend-contrib':   'Innskudd',
    'freq-monthly':          'Månedlig',
    'freq-quarterly':        'Kvartalsvis',
    'freq-semi':             'Halvårlig',
    'freq-annually':         'Årlig',
    'freq-daily':            'Daglig',
    'years-suffix':          'år',
    'chart-year-label':      'År',
    'how-tag':               'Slik fungerer det',
    'how-title':             'Kom i gang på 3 steg',
    'step-1-title':          'Opprett konto',
    'step-1-desc':           'Registrer deg gratis på under 60 sekunder. Ingen betalingskort nødvendig.',
    'step-2-title':          'Koble til Nordnet',
    'step-2-desc':           'Importer porteføljen din fra Nordnet eller legg inn investeringene manuelt.',
    'step-3-title':          'Følg veksten din',
    'step-3-desc':           'Få personlige prognoser og innsikt tilpasset det norske markedet.',
    'pricing-tag':           'Priser',
    'pricing-title':         'Enkel, transparent prising',
    'pricing-subtitle':      'Start gratis. Oppgrader når du er klar.',
    'plan-free-name':        'Gratis',
    'plan-free-price':       '0',
    'plan-free-period':      '/mnd',
    'plan-free-desc':        'Perfekt for å komme i gang',
    'plan-free-f1':          'Rentesammensetningskalkulator',
    'plan-free-f2':          'Opptil 3 porteføljer',
    'plan-free-f3':          'Målsporing',
    'plan-free-f4':          'Oslo Børs (15 min. forsinkelse)',
    'plan-free-f5':          '30-års prognoser',
    'plan-free-f6':          'Nordnet CSV-import',
    'plan-free-cta':         'Kom i gang gratis',
    'plan-pro-name':         'Pro',
    'plan-pro-badge':        'Mest populær',
    'plan-pro-price':        '99',
    'plan-pro-period':       '/mnd',
    'plan-pro-desc':         'For seriøse investorer',
    'plan-pro-f1':           'Alt i Gratis',
    'plan-pro-f2':           'Ukentlig norsk markedsdigest',
    'plan-pro-f3':           'Sanntidskurser Oslo Børs',
    'plan-pro-f4':           'Full Nordnet-integrasjon (API)',
    'plan-pro-f5':           'ASK & BSU-optimering',
    'plan-pro-f6':           'Ubegrensede porteføljer & 50-årsscenarioer',
    'plan-pro-f7':           'Smarte varsler & prioritert støtte',
    'plan-pro-cta':          'Start Pro-prøveperiode',
    'plan-teams-name':       'Team',
    'plan-teams-price':      '299',
    'plan-teams-period':     '/mnd',
    'plan-teams-desc':       'For rådgivere og familier',
    'plan-teams-f1':         'Alt i Pro',
    'plan-teams-f2':         'Opptil 5 brukere',
    'plan-teams-f3':         'Delte dashbord',
    'plan-teams-f4':         'Klientrapporteringsverktøy',
    'plan-teams-f5':         'API-tilgang',
    'plan-teams-cta':        'Kontakt salg',
    'cta-title':             'Klar til å investere smartere?',
    'cta-desc':              'Investeringsverktøy tilpasset det norske markedet. Ingen kredittkort nødvendig.',
    'cta-btn':               'Start gratis — Ingen kredittkort',
    'footer-desc':           'Investeringsverktøy bygget for norske investorer, med integrasjoner mot Nordnet og Oslo Børs.',
    'footer-disclaimer':     'CompoundIQ tilbyr ikke finansiell rådgivning. Alt innhold er kun ment som informasjon.',
    'footer-product':        'Produkt',
    'footer-features-link':  'Funksjoner',
    'footer-calculator-link':'Kalkulator',
    'footer-pricing-link':   'Priser',
    'footer-company':        'Selskap',
    'footer-about':          'Om oss',
    'footer-blog':           'Blogg',
    'footer-careers':        'Karriere',
    'footer-legal':          'Juridisk',
    'footer-privacy':        'Personvern',
    'footer-terms':          'Vilkår',
    'footer-cookies':        'Informasjonskapsler',
    'footer-copyright':      '© 2026 CompoundIQ. Alle rettigheter forbeholdt.',
    'cookie-title':          'Vi bruker informasjonskapsler',
    'cookie-desc':           'Vi bruker nødvendige informasjonskapsler for at tjenesten skal fungere. Med ditt samtykke bruker vi også analyse- og ytelseskapsler for å forbedre opplevelsen.',
    'cookie-policy-link':    'Les mer',
    'cookie-necessary':      'Kun nødvendige',
    'cookie-accept-all':     'Godta alle',
  },
  en: {
    'page-title':            'CompoundIQ — Invest smarter in the Norwegian market',
    'nav-features':          'Features',
    'nav-calculator':        'Calculator',
    'nav-pricing':           'Pricing',
    'nav-login':             'Log In',
    'nav-get-started':       'Get Started Free',
    'hero-badge':            'Built for the Norwegian market',
    'hero-title-line1':      'Invest smarter',
    'hero-title-line2':      'in Norway',
    'hero-subtitle':         'CompoundIQ gives you powerful tools to visualize and optimize your investments — with integrations for Nordnet, Oslo Stock Exchange, and Norwegian financial news.',
    'hero-cta-primary':      'Try the Calculator',
    'hero-cta-secondary':    'See How It Works',
    'highlight-1':           'Oslo Stock Exchange',
    'highlight-2':           'Nordnet Integration',
    'highlight-3':           'ASK & BSU Optimizer',
    'features-tag':          'Features',
    'features-title':        'Everything you need to grow your wealth',
    'features-subtitle':     'From simple calculators to advanced portfolio analytics — tailored to the Norwegian market.',
    'feat-nordnet-title':    'Nordnet Integration',
    'feat-nordnet-desc':     'Connect to Nordnet and automatically import your portfolio. See all your stocks and funds in one place.',
    'feat-nordnet-tag':      'Most Popular',
    'feat-oslobors-title':   'Oslo Stock Exchange & OBX',
    'feat-oslobors-desc':    'Follow Oslo Stock Exchange with price data and index updates for Norwegian stocks and funds.',
    'feat-ask-title':        'ASK & BSU Optimizer',
    'feat-ask-desc':         'Maximize your tax benefits with our calculator for Aksjesparekonto (ASK) and BSU accounts.',
    'feat-news-title':       'Norwegian Market Insights',
    'feat-news-desc':        'Weekly summaries and trends from the Norwegian stock market and financial press.',
    'feat-calc-title':       'Compound Interest Calculator',
    'feat-calc-desc':        'Visualize how your investments grow over time with our interactive calculator.',
    'feat-scenario-title':   'Scenario Modeling',
    'feat-scenario-desc':    'Run "what if" scenarios — extra contributions, different rates, market downturns.',
    'calc-tag':              'Calculator',
    'calc-title':            'See your money grow',
    'calc-subtitle':         'Use our free compound interest calculator to project your investment growth.',
    'calc-principal-label':  'Initial Investment',
    'calc-monthly-label':    'Monthly Contribution',
    'calc-rate-label':       'Annual Interest Rate',
    'calc-years-label':      'Time Period',
    'calc-freq-label':       'Compounding Frequency',
    'calc-final-label':      'Final Balance',
    'calc-contrib-label':    'Total Contributions',
    'calc-interest-label':   'Interest Earned',
    'calc-legend-balance':   'Balance',
    'calc-legend-contrib':   'Contributions',
    'freq-monthly':          'Monthly',
    'freq-quarterly':        'Quarterly',
    'freq-semi':             'Semi-Annually',
    'freq-annually':         'Annually',
    'freq-daily':            'Daily',
    'years-suffix':          'yrs',
    'chart-year-label':      'Yr',
    'how-tag':               'How It Works',
    'how-title':             'Start growing in 3 steps',
    'step-1-title':          'Create Your Account',
    'step-1-desc':           'Sign up free in under 60 seconds. No credit card required.',
    'step-2-title':          'Connect Nordnet',
    'step-2-desc':           'Import your portfolio from Nordnet or add investments manually.',
    'step-3-title':          'Track Your Growth',
    'step-3-desc':           'Get personalized projections and insights tailored to the Norwegian market.',
    'pricing-tag':           'Pricing',
    'pricing-title':         'Simple, transparent pricing',
    'pricing-subtitle':      'Start free. Upgrade when you\'re ready.',
    'plan-free-name':        'Free',
    'plan-free-price':       '0',
    'plan-free-period':      '/mo',
    'plan-free-desc':        'Perfect for getting started',
    'plan-free-f1':          'Compound interest calculator',
    'plan-free-f2':          'Up to 3 portfolios',
    'plan-free-f3':          'Goal tracking',
    'plan-free-f4':          'Oslo Stock Exchange (15 min delay)',
    'plan-free-f5':          '30-year projections',
    'plan-free-f6':          'Nordnet CSV import',
    'plan-free-cta':         'Get Started Free',
    'plan-pro-name':         'Pro',
    'plan-pro-badge':        'Most Popular',
    'plan-pro-price':        '99',
    'plan-pro-period':       '/mo',
    'plan-pro-desc':         'For serious investors',
    'plan-pro-f1':           'Everything in Free',
    'plan-pro-f2':           'Weekly Norwegian market digest',
    'plan-pro-f3':           'Real-time Oslo Stock Exchange',
    'plan-pro-f4':           'Full Nordnet integration (API)',
    'plan-pro-f5':           'ASK & BSU optimizer',
    'plan-pro-f6':           'Unlimited portfolios & 50-year scenarios',
    'plan-pro-f7':           'Smart alerts & priority support',
    'plan-pro-cta':          'Start Pro Trial',
    'plan-teams-name':       'Teams',
    'plan-teams-price':      '299',
    'plan-teams-period':     '/mo',
    'plan-teams-desc':       'For advisors & families',
    'plan-teams-f1':         'Everything in Pro',
    'plan-teams-f2':         'Up to 5 users',
    'plan-teams-f3':         'Shared dashboards',
    'plan-teams-f4':         'Client reporting tools',
    'plan-teams-f5':         'API access',
    'plan-teams-cta':        'Contact Sales',
    'cta-title':             'Ready to invest smarter?',
    'cta-desc':              'Investment tools built for the Norwegian market. No credit card required.',
    'cta-btn':               'Start for Free — No Credit Card',
    'footer-desc':           'Investment tools built for Norwegian investors, with integrations for Nordnet and Oslo Stock Exchange.',
    'footer-disclaimer':     'CompoundIQ does not provide financial advice. All content is for informational purposes only.',
    'footer-product':        'Product',
    'footer-features-link':  'Features',
    'footer-calculator-link':'Calculator',
    'footer-pricing-link':   'Pricing',
    'footer-company':        'Company',
    'footer-about':          'About',
    'footer-blog':           'Blog',
    'footer-careers':        'Careers',
    'footer-legal':          'Legal',
    'footer-privacy':        'Privacy Policy',
    'footer-terms':          'Terms of Service',
    'footer-cookies':        'Cookie Policy',
    'footer-copyright':      '© 2026 CompoundIQ. All rights reserved.',
    'cookie-title':          'We use cookies',
    'cookie-desc':           'We use necessary cookies to make our service work. With your consent, we also use analytics and performance cookies to improve your experience.',
    'cookie-policy-link':    'Learn more',
    'cookie-necessary':      'Necessary only',
    'cookie-accept-all':     'Accept all',
  }
};

// === Language system ===
let currentLang = localStorage.getItem('ciq-lang') || 'no';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('ciq-lang', lang);
  document.documentElement.lang = lang;
  document.title = translations[lang]['page-title'];

  // Update all data-i18n text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      el.textContent = translations[lang][key];
    }
  });

  // Update select options
  document.querySelectorAll('select option[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      el.textContent = translations[lang][key];
    }
  });

  // Update lang toggle active states (all toggles on page)
  document.querySelectorAll('.lang-option').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-lang') === lang);
  });

  // Re-render chart with updated label
  calculateCompound();
}

function initLangToggles() {
  document.querySelectorAll('.lang-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      setLanguage(currentLang === 'no' ? 'en' : 'no');
    });
  });
}

// === Navbar scroll effect ===
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// === Mobile menu toggle ===
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// === Compound Interest Calculator ===
const principalInput   = document.getElementById('principal');
const monthlyInput     = document.getElementById('monthlyContrib');
const rateInput        = document.getElementById('rate');
const yearsInput       = document.getElementById('years');
const compoundSelect   = document.getElementById('compound');
const finalBalanceEl   = document.getElementById('finalBalance');
const totalContribEl   = document.getElementById('totalContrib');
const interestEarnedEl = document.getElementById('interestEarned');

function formatCurrency(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(2).replace('.', ',') + ' mrd. kr';
  if (value >= 1e6) return (value / 1e6).toFixed(2).replace('.', ',') + ' mill. kr';
  return value.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' kr';
}

function calculateCompound() {
  const P  = parseFloat(principalInput.value)   || 0;
  const r  = (parseFloat(rateInput.value)  || 0) / 100;
  const t  = parseInt(yearsInput.value)          || 1;
  const n  = parseInt(compoundSelect.value)      || 12;
  const mc = parseFloat(monthlyInput.value)      || 0;

  const dataPoints = [];
  const contribPoints = [];

  for (let year = 0; year <= t; year++) {
    const lumpSum = P * Math.pow(1 + r / n, n * year);
    const periods = n * year;
    const rPerPeriod = r / n;
    const contribFV = mc > 0 && rPerPeriod > 0
      ? mc * (Math.pow(1 + rPerPeriod, periods) - 1) / rPerPeriod
      : mc * periods;

    dataPoints.push(lumpSum + contribFV);
    contribPoints.push(P + mc * 12 * year);
  }

  const finalBalance  = dataPoints[dataPoints.length - 1];
  const totalContrib  = P + mc * 12 * t;
  const interestEarned = finalBalance - totalContrib;

  finalBalanceEl.textContent   = formatCurrency(finalBalance);
  totalContribEl.textContent   = formatCurrency(totalContrib);
  interestEarnedEl.textContent = formatCurrency(Math.max(0, interestEarned));

  drawChart(dataPoints, contribPoints, t);
}

// === Chart drawing (vanilla Canvas) ===
function drawChart(balanceData, contribData, years) {
  const canvas = document.getElementById('growthChart');
  if (!canvas) return;

  const container = canvas.parentElement;
  const dpr    = window.devicePixelRatio || 1;
  const width  = container.clientWidth  || 500;
  const height = container.clientHeight || 220;

  canvas.width  = width  * dpr;
  canvas.height = height * dpr;
  canvas.style.width  = width  + 'px';
  canvas.style.height = height + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const padL = 20, padR = 20, padT = 16, padB = 32;
  const chartW = width  - padL - padR;
  const chartH = height - padT - padB;
  const maxVal = Math.max(...balanceData, 1);
  const points = balanceData.length;

  function toX(i) { return padL + (i / (points - 1)) * chartW; }
  function toY(v) { return padT + (1 - v / maxVal) * chartH; }

  ctx.clearRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
  }

  // Contribution area
  const gradContrib = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  gradContrib.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
  gradContrib.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(contribData[0]));
  for (let i = 1; i < points; i++) ctx.lineTo(toX(i), toY(contribData[i]));
  ctx.lineTo(toX(points - 1), padT + chartH);
  ctx.lineTo(toX(0), padT + chartH);
  ctx.closePath();
  ctx.fillStyle = gradContrib;
  ctx.fill();

  // Balance area
  const gradBalance = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  gradBalance.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
  gradBalance.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(balanceData[0]));
  for (let i = 1; i < points; i++) {
    const prevX = toX(i - 1), currX = toX(i), cpX = (prevX + currX) / 2;
    ctx.bezierCurveTo(cpX, toY(balanceData[i - 1]), cpX, toY(balanceData[i]), currX, toY(balanceData[i]));
  }
  ctx.lineTo(toX(points - 1), padT + chartH);
  ctx.lineTo(toX(0), padT + chartH);
  ctx.closePath();
  ctx.fillStyle = gradBalance;
  ctx.fill();

  // Contribution line
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(contribData[0]));
  for (let i = 1; i < points; i++) ctx.lineTo(toX(i), toY(contribData[i]));
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Balance line
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(balanceData[0]));
  for (let i = 1; i < points; i++) {
    const prevX = toX(i - 1), currX = toX(i), cpX = (prevX + currX) / 2;
    ctx.bezierCurveTo(cpX, toY(balanceData[i - 1]), cpX, toY(balanceData[i]), currX, toY(balanceData[i]));
  }
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // X-axis year labels
  const yearLabel = translations[currentLang]['chart-year-label'] || 'År';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  const labelCount = Math.min(years, 6);
  const step = Math.floor(years / labelCount);
  for (let i = 0; i <= years; i += step || 1) {
    if (i > years) break;
    const idx = Math.round((i / years) * (points - 1));
    ctx.fillText(yearLabel + ' ' + i, toX(idx), height - 6);
  }
  ctx.fillText(yearLabel + ' ' + years, toX(points - 1), height - 6);
}

// === Debounce ===
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

const debouncedCalc = debounce(calculateCompound, 120);

[principalInput, monthlyInput, rateInput, yearsInput, compoundSelect].forEach(el => {
  el.addEventListener('input', debouncedCalc);
});

window.addEventListener('resize', debounce(calculateCompound, 200), { passive: true });

// === Intersection Observer for fade-in animations ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.feature-card, .pricing-card, .step').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
  .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .fade-in.visible { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(fadeStyle);

// === Cookie Consent ===
const COOKIE_KEY = 'ciq-cookie-consent';

function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  // Already consented — don't show
  if (localStorage.getItem(COOKIE_KEY)) return;

  // Show after a short delay so the page renders first
  setTimeout(() => banner.classList.add('visible'), 800);

  document.getElementById('cookieAcceptAll').addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'all');
    banner.classList.remove('visible');
    // TODO: initialise analytics/performance scripts here when ready
  });

  document.getElementById('cookieNecessary').addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'necessary');
    banner.classList.remove('visible');
  });
}

// === Init ===
window.addEventListener('DOMContentLoaded', () => {
  initLangToggles();
  setLanguage(currentLang);
  initCookieBanner();
});

if (document.readyState !== 'loading') {
  initLangToggles();
  setLanguage(currentLang);
  initCookieBanner();
}
