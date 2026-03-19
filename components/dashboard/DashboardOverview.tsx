'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  fetchBudgetSavingsThread,
  formatBudgetCurrency,
  type BudgetSavingsThread,
} from '@/lib/budget-data'
import {
  calculatePortfolioSummary,
  defaultDashboardSettings,
  fetchDashboardSettingsBundle,
  fetchPortfolioHoldings,
  formatCurrency,
  formatPercent,
  getDataErrorMessage,
  type DashboardSettings,
  type PortfolioHolding,
} from '@/lib/dashboard-data'

interface DashboardOverviewProps {
  displayName: string
}

interface ControlRoomMetric {
  label: string
  value: string
  hint: string
}

interface ControlRoomPolicyCard {
  label: string
  value: string
  hint: string
}

interface ControlRoomAction {
  title: string
  description: string
  href: string
  cta: string
  tone: 'positive' | 'warning' | 'neutral'
}

export default function DashboardOverview({ displayName }: DashboardOverviewProps) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [settings, setSettings] = useState<DashboardSettings>(defaultDashboardSettings)
  const [budgetThread, setBudgetThread] = useState<BudgetSavingsThread | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [portfolio, bundle, budget] = await Promise.all([
          fetchPortfolioHoldings(),
          fetchDashboardSettingsBundle(),
          fetchBudgetSavingsThread().catch(() => null),
        ])

        if (!active) {
          return
        }

        setHoldings(portfolio)
        setSettings(bundle.settings)
        setBudgetThread(budget)
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error ? getDataErrorMessage(loadError.message) : getDataErrorMessage()
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [])

  const summary = calculatePortfolioSummary(holdings, settings)
  const hasHoldings = holdings.length > 0
  const displayGain =
    summary.totalCost > 0
      ? `${formatCurrency(summary.totalGain)} (${formatPercent(summary.totalGainPct)})`
      : loading
        ? 'Laster...'
        : 'Ingen data enda'

  const controlRoom = useMemo(
    () => buildControlRoom(budgetThread, settings, hasHoldings),
    [budgetThread, settings, hasHoldings]
  )

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <div className="dash-header-row">
            <h1 className="dash-title">Hei, {displayName}</h1>
          </div>
          <p className="dash-subtitle">Her er den manedlige kontrollflaten din akkurat naa.</p>
        </div>
        <div className="dash-actions">
          <Link href="/dashboard/budget" className="btn btn-outline">
            Apne budsjett
          </Link>
          <Link href="/dashboard/portfolio" className="btn btn-primary">
            + Legg til portefolje
          </Link>
        </div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      <div className="dash-stats">
        <StatCard
          label="Total portefoljeverdi"
          value={hasHoldings ? formatCurrency(summary.totalValue) : loading ? 'Laster...' : 'Ingen data'}
          hint="Bygges fra manuelle posisjoner lagret paa kontoen din."
        />
        <StatCard
          label="Total avkastning"
          value={displayGain}
          hint="Sammenligner kostpris mot estimert markedsverdi."
        />
        <StatCard
          label="Estimert verdi om 10 aar"
          value={
            hasHoldings ? formatCurrency(summary.projectedValue10y) : loading ? 'Laster...' : 'Ingen data'
          }
          hint={`Basert paa ${settings.expectedReturn.toFixed(1).replace('.', ',')} % forventet avkastning og ${formatCurrency(settings.monthlyContribution)} i manedlig sparing.`}
        />
        <StatCard
          label="ASK-andel"
          value={hasHoldings ? formatPercent(summary.askShare) : loading ? 'Laster...' : 'Ingen data'}
          hint="Andel av dagens portefoljeverdi som ligger paa ASK."
        />
      </div>

      <div className="dash-section">
        <div className="dash-header-row dashboard-section-header">
          <h2 className="dash-section-title">Manedlig kontrollrom</h2>
          <span className={`control-room-pill control-room-pill-${controlRoom.pillTone}`}>
            {controlRoom.pillLabel}
          </span>
        </div>

        {budgetThread ? (
          <div className="dashboard-grid control-room-grid">
            <div className="dashboard-panel control-room-panel">
              <div className="dash-stats dash-stats-four control-room-stats">
                {controlRoom.metrics.map((metric) => (
                  <StatCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    hint={metric.hint}
                  />
                ))}
              </div>

              <div className="control-room-policy-grid">
                {controlRoom.policyCards.map((card) => (
                  <div key={card.label} className="control-room-policy-card">
                    <span className="stat-label">{card.label}</span>
                    <strong>{card.value}</strong>
                    <span className="stat-hint">{card.hint}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel control-room-actions-panel">
              <div className="dash-header-row">
                <h3 className="dash-section-title">Anbefalte neste trekk</h3>
                <Link href="/dashboard/settings" className="btn btn-ghost btn-sm">
                  Juster policy
                </Link>
              </div>

              <div className="control-room-actions">
                {controlRoom.actions.map((action) => (
                  <ActionCard key={action.title} action={action} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-panel">
            <p className="panel-copy">
              Sett opp budsjettet ditt for aa faa et ekte kontrollrom med overskudd, fordeling og
              anbefalte neste trekk.
            </p>
            <div className="dash-actions">
              <Link href="/dashboard/budget" className="btn btn-primary">
                Sett opp budsjett
              </Link>
              <Link href="/dashboard/calculator" className="btn btn-outline">
                Apne kalkulator
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Kom i gang</h2>
        <div className="dash-cards">
          <QuickCard
            icon="Cash"
            title="Budsjett"
            desc="Finn realistisk overskudd hver maned og send det videre til sparing og investering."
            href="/dashboard/budget"
            cta="Apne budsjett"
          />
          <QuickCard
            icon="Chart"
            title="Kalkulator"
            desc="Bruk renters rente-kalkulatoren med sparing hentet fra budsjettet."
            href="/dashboard/calculator"
            cta="Apne kalkulator"
          />
          <QuickCard
            icon="Port"
            title="Portefolje"
            desc="Legg inn beholdninger, kostpris og naakurs. Oversikten oppdateres automatisk."
            href="/dashboard/portfolio"
            cta="Se portefolje"
          />
          <QuickCard
            icon="ASK"
            title="ASK og BSU"
            desc="Bruk budsjettoverkuddet ditt til aa planlegge BSU, buffer og investering side om side."
            href="/dashboard/ask-bsu"
            cta="Apne planner"
          />
        </div>
      </div>
    </div>
  )
}

function buildControlRoom(
  budgetThread: BudgetSavingsThread | null,
  settings: DashboardSettings,
  hasHoldings: boolean
) {
  if (!budgetThread) {
    return {
      pillTone: 'neutral' as const,
      pillLabel: 'Venter paa budsjett',
      metrics: [] as ControlRoomMetric[],
      policyCards: [] as ControlRoomPolicyCard[],
      actions: [
        {
          title: 'Sett opp manedsbudsjettet',
          description:
            'Start med inntekter, utgifter og sparekategorier. Derfra kan dashboardet foreslaa hva du faktisk kan investere.',
          href: '/dashboard/budget',
          cta: 'Sett opp budsjett',
          tone: 'neutral' as const,
        },
      ],
    }
  }

  const investGap = budgetThread.availableToInvest - settings.monthlyContribution
  const annualInvest = budgetThread.availableToInvest * 12
  const annualBuffer = budgetThread.availableToBuffer * 12
  const annualBsu = Math.min(27500, budgetThread.availableToBsu * 12)
  const freeSlack = budgetThread.availableGeneralSavings

  const metrics: ControlRoomMetric[] = [
    {
      label: 'Kan settes av',
      value: formatBudgetCurrency(budgetThread.availableToSave),
      hint: 'Planlagt inntekt minus planlagte utgifter denne maneden.',
    },
    {
      label: 'Til investering',
      value: formatBudgetCurrency(budgetThread.availableToInvest),
      hint: `${budgetThread.investmentAllocationPct.toFixed(0)} % av overskuddet sendes til investering.`,
    },
    {
      label: 'Til buffer og BSU',
      value: formatBudgetCurrency(budgetThread.availableToBuffer + budgetThread.availableToBsu),
      hint: `${(
        budgetThread.bufferAllocationPct + budgetThread.bsuAllocationPct
      ).toFixed(0)} % holdes igjen for kortsiktige mal.`,
    },
    {
      label: 'Fritt handlingsrom',
      value: formatBudgetCurrency(freeSlack),
      hint:
        freeSlack > 0
          ? 'Ikke-fordelt overskudd som kan brukes fleksibelt.'
          : 'Alt overskudd er allerede fordelt i policyen din.',
    },
  ]

  const policyCards: ControlRoomPolicyCard[] = [
    {
      label: 'Investerbart per aar',
      value: formatBudgetCurrency(annualInvest),
      hint: 'Dersom du holder samme manedlige takt i 12 maneder.',
    },
    {
      label: 'BSU-fart per aar',
      value: formatBudgetCurrency(annualBsu),
      hint:
        annualBsu >= 27500
          ? 'Du ligger an til aa fylle hele BSU-rammen.'
          : 'Dette er hva dagens fordeling gir mot BSU i ar.',
    },
    {
      label: 'Bufferbygging per aar',
      value: formatBudgetCurrency(annualBuffer),
      hint: 'Brukes til aa bygge reserve og redusere press i svakere maneder.',
    },
    {
      label: 'Avvik mot sparemal',
      value:
        investGap >= 0
          ? `+ ${formatBudgetCurrency(investGap)}`
          : `- ${formatBudgetCurrency(Math.abs(investGap))}`,
      hint:
        investGap >= 0
          ? 'Budsjettet stotter et investeringsniva over standardmalet ditt.'
          : 'Standardmalet ditt er hoyere enn det budsjettet stotter akkurat naa.',
    },
  ]

  const actions: ControlRoomAction[] = []

  if (budgetThread.availableToSave <= 0) {
    actions.push({
      title: 'Skap overskudd forst',
      description:
        'Planen din viser ikke positivt sparegrunnlag denne maneden. Gaa gjennom utgiftene og finn rom for et lite nettooverskudd.',
      href: '/dashboard/budget',
      cta: 'Juster budsjett',
      tone: 'warning',
    })
  }

  if (budgetThread.availableToBsu > 0) {
    actions.push({
      title: 'Bruk BSU-kapasiteten',
      description: `Dagens policy sender ${formatBudgetCurrency(
        budgetThread.availableToBsu
      )} per maned mot BSU. Hold tempoet hvis du vil fylle arskvoten raskere.`,
      href: '/dashboard/ask-bsu',
      cta: 'Se ASK og BSU',
      tone: 'positive',
    })
  }

  if (!hasHoldings && budgetThread.availableToInvest > 0) {
    actions.push({
      title: 'Bygg din forste portefolje',
      description: `Du har ${formatBudgetCurrency(
        budgetThread.availableToInvest
      )} klar til investering hver maned, men ingen posisjoner registrert enda.`,
      href: '/dashboard/portfolio',
      cta: 'Legg til portefolje',
      tone: 'positive',
    })
  }

  if (hasHoldings && investGap < 0) {
    actions.push({
      title: 'Juster sparemalet til virkeligheten',
      description:
        'Investeringsmalet ditt ligger over det budsjettet stotter. Senk standardmalet eller skap mer overskudd for aa unngaa friksjon.',
      href: '/dashboard/settings',
      cta: 'Oppdater innstillinger',
      tone: 'warning',
    })
  }

  if (hasHoldings && budgetThread.availableToInvest > 0 && investGap >= 0) {
    actions.push({
      title: 'Ok manedlig investeringsflyt',
      description: `Budsjettet ditt stotter ${formatBudgetCurrency(
        budgetThread.availableToInvest
      )} per maned til investering. Send dette videre til kalkulatoren og ASK-planen.`,
      href: '/dashboard/calculator',
      cta: 'Bruk i kalkulator',
      tone: 'positive',
    })
  }

  if (freeSlack > 0) {
    actions.push({
      title: 'Gi det frie overskuddet en jobb',
      description: `Du har ${formatBudgetCurrency(
        freeSlack
      )} som ikke er fordelt enda. Vurder om det skal til buffer, BSU eller investering.`,
      href: '/dashboard/settings',
      cta: 'Juster fordeling',
      tone: 'neutral',
    })
  }

  while (actions.length < 3) {
    actions.push({
      title: 'Hold kontroll hver maned',
      description:
        'Oppdater budsjettet og bruk kontrollrommet som fast sjekkpunkt for hva du realistisk kan spare og investere.',
      href: '/dashboard/budget',
      cta: 'Se budsjett',
      tone: 'neutral',
    })
  }

  let pillTone: 'positive' | 'warning' | 'neutral' = 'neutral'
  let pillLabel = 'Trenger oppmerksomhet'

  if (budgetThread.availableToSave > 0 && investGap >= 0) {
    pillTone = 'positive'
    pillLabel = 'Paa sporet'
  } else if (budgetThread.availableToSave <= 0 || investGap < 0) {
    pillTone = 'warning'
    pillLabel = 'Krever justering'
  }

  return {
    pillTone,
    pillLabel,
    metrics,
    policyCards,
    actions: actions.slice(0, 3),
  }
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value stat-value-lg">{value}</span>
      <span className="stat-hint">{hint}</span>
    </div>
  )
}

function ActionCard({ action }: { action: ControlRoomAction }) {
  return (
    <div className={`control-room-action control-room-action-${action.tone}`}>
      <div>
        <strong>{action.title}</strong>
        <p>{action.description}</p>
      </div>
      <Link href={action.href} className="btn btn-ghost">
        {action.cta}
      </Link>
    </div>
  )
}

function QuickCard({
  icon,
  title,
  desc,
  href,
  cta,
}: {
  icon: string
  title: string
  desc: string
  href: string
  cta: string
}) {
  return (
    <div className="quick-card">
      <div className="quick-card-icon quick-card-icon-text">{icon}</div>
      <div className="quick-card-body">
        <div className="quick-card-title-row">
          <h3>{title}</h3>
        </div>
        <p>{desc}</p>
      </div>
      <Link href={href} className="btn btn-ghost quick-card-btn">
        {cta}
      </Link>
    </div>
  )
}
