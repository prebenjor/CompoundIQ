/* ===========================
   CompoundIQ — Main Scripts
   =========================== */

// === Navbar scroll effect ===
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
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
  if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
    // Balance from lump sum
    const lumpSum = P * Math.pow(1 + r / n, n * year);
    // Future value of monthly contributions (annuity formula)
    const periods = n * year;
    const rPerPeriod = r / n;
    const contribFV = mc > 0 && rPerPeriod > 0
      ? mc * (Math.pow(1 + rPerPeriod, periods) - 1) / rPerPeriod
      : mc * periods;

    const balance = lumpSum + contribFV;
    const contributions = P + mc * 12 * year;

    dataPoints.push(balance);
    contribPoints.push(contributions);
  }

  const finalBalance = dataPoints[dataPoints.length - 1];
  const totalContrib = P + mc * 12 * t;
  const interestEarned = finalBalance - totalContrib;

  finalBalanceEl.textContent   = formatCurrency(finalBalance);
  totalContribEl.textContent   = formatCurrency(totalContrib);
  interestEarnedEl.textContent = formatCurrency(Math.max(0, interestEarned));

  drawChart(dataPoints, contribPoints, t);
}

// === Chart drawing (vanilla Canvas) ===
let animationFrame = null;

function drawChart(balanceData, contribData, years) {
  const canvas = document.getElementById('growthChart');
  if (!canvas) return;

  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
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

  // Contribution area fill
  const gradContrib = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  gradContrib.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
  gradContrib.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  ctx.beginPath();
  ctx.moveTo(toX(0), toY(contribData[0]));
  for (let i = 1; i < points; i++) {
    ctx.lineTo(toX(i), toY(contribData[i]));
  }
  ctx.lineTo(toX(points - 1), padT + chartH);
  ctx.lineTo(toX(0), padT + chartH);
  ctx.closePath();
  ctx.fillStyle = gradContrib;
  ctx.fill();

  // Balance area fill
  const gradBalance = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  gradBalance.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
  gradBalance.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  ctx.beginPath();
  ctx.moveTo(toX(0), toY(balanceData[0]));
  for (let i = 1; i < points; i++) {
    // Smooth bezier
    const prevX = toX(i - 1);
    const currX = toX(i);
    const cpX = (prevX + currX) / 2;
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
  for (let i = 1; i < points; i++) {
    ctx.lineTo(toX(i), toY(contribData[i]));
  }
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Balance line
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(balanceData[0]));
  for (let i = 1; i < points; i++) {
    const prevX = toX(i - 1);
    const currX = toX(i);
    const cpX = (prevX + currX) / 2;
    ctx.bezierCurveTo(cpX, toY(balanceData[i - 1]), cpX, toY(balanceData[i]), currX, toY(balanceData[i]));
  }
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // X-axis labels
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  const labelCount = Math.min(years, 6);
  const step = Math.floor(years / labelCount);
  for (let i = 0; i <= years; i += step || 1) {
    if (i > years) break;
    const idx = Math.round((i / years) * (points - 1));
    ctx.fillText('Yr ' + i, toX(idx), height - 6);
  }
  // Always label last year
  ctx.fillText('Yr ' + years, toX(points - 1), height - 6);
}

// Debounce helper
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const debouncedCalc = debounce(calculateCompound, 120);

[principalInput, monthlyInput, rateInput, yearsInput, compoundSelect].forEach(el => {
  el.addEventListener('input', debouncedCalc);
});

// Redraw chart on resize
window.addEventListener('resize', debounce(() => {
  calculateCompound();
}, 200), { passive: true });

// === Intersection Observer for fade-in animations ===
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .step').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Add fade-in CSS via JS to keep HTML clean
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(fadeStyle);

// === Initial calculation on load ===
window.addEventListener('DOMContentLoaded', () => {
  calculateCompound();
});

// Fallback if DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  calculateCompound();
}
