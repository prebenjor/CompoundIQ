'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  fetchBudgetSavingsThread,
  formatBudgetCurrency,
  type BudgetSavingsThread,
} from '@/lib/budget-data'
import {
  deriveGoalSummaries,
  fetchUserGoals,
  type GoalSummary,
  type UserGoal,
} from '@/lib/goals-data'
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
  const [goals, setGoals] = useState<UserGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [portfolio, bundle, budget, userGoals] = await Promise.all([
          fetchPortfolioHoldings(),
          fetchDashboardSettingsBundle(),
          fetchBudgetSavingsThread().catch(() => null),
          fetchUserGoals().catch(() => []),
        ])

        if (!active) {
          return
        }

        setHoldings(portfolio)
        setSettings(bundle.settings)
        setBudgetThread(budget)
        setGoals(userGoals)
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
  const bsuEnabled = settings.bsuEnabled
  const displayGain =
    summary.totalCost > 0
      ? `${formatCurrency(summary.totalGain)} (${formatPercent(summary.totalGainPct)})`
      : loading
        ? 'Laster...'
        : 'Ingen data enda'

  const goalSummaries = useMemo(() => deriveGoalSummaries(goals, budgetThread), [goals, budgetThread])
  const controlRoom = useMemo(
    () => buildControlRoom(budgetThread, settings, hasHoldings, goalSummaries),
    [budgetThread, settings, hasHoldings, goalSummaries]
  )

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <div className="dash-header-row">
            <h1 className="dash-title">Hei, {displayName}</h1>
          </div>
          <p className="dash-subtitle">Her er den månedlige kontrollflaten din akkurat nå.</p>
        </div>
        <div className="dash-actions">
          <Link href="/dashboard/budget" className="btn btn-outline">
            Åpne budsjett
          </Link>
          <Link href="/dashboard/portfolio" className="btn btn-primary">
            + Legg til portefølje
          </Link>
        </div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      <div className="dash-stats">
        <StatCard
          label="Total porteføljeverdi"
          value={hasHoldings ? formatCurrency(summary.totalValue) : loading ? 'Laster...' : 'Ingen data'}
          hint="Bygges fra manuelle posisjoner lagret på kontoen din."
        />
        <StatCard
          label="Total avkastning"
          value={displayGain}
          hint="Sammenligner kostpris mot estimert markedsverdi."
        />
        <StatCard
          label="Estimert verdi om 10 år"
          value={
            hasHoldings ? formatCurrency(summary.projectedValue10y) : loading ? 'Laster...' : 'Ingen data'
          }
          hint={`Basert på ${settings.expectedReturn.toFixed(1).replace('.', ',')} % forventet avkastning og ${formatCurrency(settings.monthlyContribution)} i månedlig sparing.`}
        />
        <StatCard
          label="ASK-andel"
          value={hasHoldings ? formatPercent(summary.askShare) : loading ? 'Laster...' : 'Ingen data'}
          hint="Andel av dagens porteføljeverdi som ligger på ASK."
        />
      </div>

      <div className="dash-section">
        <div className="dash-header-row dashboard-section-header">
          <h2 className="dash-section-title">Månedlig kontrollrom</h2>
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
              Sett opp budsjettet ditt for å få et ekte kontrollrom med overskudd, fordeling og
              anbefalte neste trekk.
            </p>
            <div className="dash-actions">
              <Link href="/dashboard/budget" className="btn btn-primary">
                Sett opp budsjett
              </Link>
              <Link href="/dashboard/calculator" className="btn btn-outline">
                Åpne kalkulator
              </Link>
            </div>
          </div>
        )}
      </div>

      {goalSummaries.length > 0 ? (
        <div className="dash-section">
          <div className="dash-header-row dashboard-section-header">
            <h2 className="dash-section-title">Mål i fokus</h2>
            <Link href="/dashboard/goals" className="btn btn-ghost btn-sm">
              Åpne mål
            </Link>
          </div>
          <div className="dash-stats dash-stats-two">
            {goalSummaries.map((summary) => (
              <GoalCard key={summary.goal.id} summary={summary} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="dash-section">
        <h2 className="dash-section-title">Kom i gang</h2>
        <div className="dash-cards">
          <QuickCard
            icon="Cash"
            title="Budsjett"
            desc="Finn realistisk overskudd hver måned og send det videre til sparing og investering."
            href="/dashboard/budget"
            cta="Åpne budsjett"
          />
          <QuickCard
            icon="Chart"
            title="Kalkulator"
            desc="Bruk renters rente-kalkulatoren med sparing hentet fra budsjettet."
            href="/dashboard/calculator"
            cta="Åpne kalkulator"
          />
          <QuickCard
            icon="Goal"
            title="Mål"
            desc={
              bsuEnabled
                ? 'Følg nødbuffer og BSU mot realistiske datoer basert på månedlig overskudd.'
                : 'Følg nødbuffer og andre mål mot realistiske datoer basert på månedlig overskudd.'
            }
            href="/dashboard/goals"
            cta="Se mål"
          />
          <QuickCard
            icon="Port"
            title="Portefølje"
            desc="Legg inn beholdninger, kostpris og dagens verdi manuelt for å følge utviklingen."
            href="/dashboard/portfolio"
            cta="Se portefølje"
          />
          <QuickCard
            icon="ASK"
            title={bsuEnabled ? 'ASK og BSU' : 'ASK'}
            desc={
              bsuEnabled
                ? 'Bruk budsjettoverskuddet ditt til å planlegge BSU, buffer og investering side om side.'
                : 'Bruk budsjettoverskuddet ditt til å planlegge ASK, buffer og investering side om side.'
            }
            href="/dashboard/ask-bsu"
            cta={bsuEnabled ? 'Åpne planlegger' : 'Åpne ASK-planner'}
          />
        </div>
      </div>
    </div>
  )
}

function buildControlRoom(
  budgetThread: BudgetSavingsThread | null,
  settings: DashboardSettings,
  hasHoldings: boolean,
  goalSummaries: GoalSummary[]
) {
  if (!budgetThread) {
    return {
      pillTone: 'neutral' as const,
      pillLabel: 'Venter på budsjett',
      metrics: [] as ControlRoomMetric[],
      policyCards: [] as ControlRoomPolicyCard[],
      actions: [
        {
          title: 'Sett opp månedsbudsjettet',
          description:
            'Start med inntekter, utgifter og sparekategorier. Derfra kan dashboardet foreslå hva du faktisk kan investere.',
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
      hint: 'Planlagt inntekt minus planlagte utgifter denne måneden.',
    },
    {
      label: 'Til investering',
      value: formatBudgetCurrency(budgetThread.availableToInvest),
      hint: `${budgetThread.investmentAllocationPct.toFixed(0)} % av overskuddet sendes til investering.`,
    },
    {
      label: budgetThread.bsuEnabled ? 'Til buffer og BSU' : 'Til buffer',
      value: formatBudgetCurrency(
        budgetThread.availableToBuffer + (budgetThread.bsuEnabled ? budgetThread.availableToBsu : 0)
      ),
      hint: budgetThread.bsuEnabled
        ? `${(
            budgetThread.bufferAllocationPct + budgetThread.bsuAllocationPct
          ).toFixed(0)} % holdes igjen for kortsiktige mål.`
        : `${budgetThread.bufferAllocationPct.toFixed(0)} % holdes igjen til buffer og trygg reserve.`,
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
      label: 'Investerbart per år',
      value: formatBudgetCurrency(annualInvest),
      hint: 'Dersom du holder samme månedlige takt i 12 måneder.',
    },
    ...(budgetThread.bsuEnabled
      ? [
          {
            label: 'BSU-fart per år',
            value: formatBudgetCurrency(annualBsu),
            hint:
              annualBsu >= 27500
                ? 'Du ligger an til å fylle hele BSU-rammen.'
                : 'Dette er hva dagens fordeling gir mot BSU i år.',
          },
        ]
      : []),
    {
      label: 'Bufferbygging per år',
      value: formatBudgetCurrency(annualBuffer),
      hint: 'Brukes til å bygge reserve og redusere press i svakere måneder.',
    },
    {
      label: 'Avvik mot sparemål',
      value:
        investGap >= 0
          ? `+ ${formatBudgetCurrency(investGap)}`
          : `- ${formatBudgetCurrency(Math.abs(investGap))}`,
      hint:
        investGap >= 0
          ? 'Budsjettet støtter et investeringsnivå over standardmålet ditt.'
          : 'Standardmålet ditt er høyere enn det budsjettet støtter akkurat nå.',
    },
  ].slice(0, 4)

  const actions: ControlRoomAction[] = []

  if (budgetThread.availableToSave <= 0) {
    actions.push({
      title: 'Skap overskudd først',
      description:
        'Planen din viser ikke positivt sparegrunnlag denne måneden. Gå gjennom utgiftene og finn rom for et lite nettooverskudd.',
      href: '/dashboard/budget',
      cta: 'Juster budsjett',
      tone: 'warning',
    })
  }

  if (budgetThread.bsuEnabled && budgetThread.availableToBsu > 0) {
    actions.push({
      title: 'Bruk BSU-kapasiteten',
      description: `Dagens policy sender ${formatBudgetCurrency(
        budgetThread.availableToBsu
      )} per måned mot BSU. Hold tempoet hvis du vil fylle årskvoten raskere.`,
      href: '/dashboard/ask-bsu',
      cta: 'Se ASK og BSU',
      tone: 'positive',
    })
  }

  const behindGoal = goalSummaries.find(
    (summary) => summary.goal.status === 'active' && !summary.isOnTrack && summary.remainingAmount > 0
  )

  if (behindGoal) {
    actions.push({
      title: `Løft ${behindGoal.goal.title}`,
      description: behindGoal.guidance,
      href: '/dashboard/goals',
      cta: 'Juster mål',
      tone: 'warning',
    })
  }

  if (!hasHoldings && budgetThread.availableToInvest > 0) {
    actions.push({
      title: 'Bygg din første portefølje',
      description: `Du har ${formatBudgetCurrency(
        budgetThread.availableToInvest
      )} klar til investering hver måned, men ingen posisjoner registrert enda.`,
      href: '/dashboard/portfolio',
      cta: 'Legg til portefølje',
      tone: 'positive',
    })
  }

  if (hasHoldings && investGap < 0) {
    actions.push({
      title: 'Juster sparemålet til virkeligheten',
      description:
        'Investeringsmålet ditt ligger over det budsjettet støtter. Senk standardmålet eller skap mer overskudd for å unngå friksjon.',
      href: '/dashboard/settings',
      cta: 'Oppdater innstillinger',
      tone: 'warning',
    })
  }

  if (hasHoldings && budgetThread.availableToInvest > 0 && investGap >= 0) {
    actions.push({
      title: 'Ok månedlig investeringsflyt',
      description: `Budsjettet ditt støtter ${formatBudgetCurrency(
        budgetThread.availableToInvest
      )} per måned til investering. Send dette videre til kalkulatoren og ASK-planen.`,
      href: '/dashboard/calculator',
      cta: 'Bruk i kalkulator',
      tone: 'positive',
    })
  }

  if (freeSlack > 0) {
    actions.push({
      title: 'Gi det frie overskuddet en jobb',
      description: budgetThread.bsuEnabled
        ? `Du har ${formatBudgetCurrency(
            freeSlack
          )} som ikke er fordelt enda. Vurder om det skal til buffer, BSU eller investering.`
        : `Du har ${formatBudgetCurrency(
            freeSlack
          )} som ikke er fordelt enda. Vurder om det skal til buffer eller investering.`,
      href: '/dashboard/settings',
      cta: 'Juster fordeling',
      tone: 'neutral',
    })
  }

  while (actions.length < 3) {
    actions.push({
      title: 'Hold kontroll hver måned',
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
    pillLabel = 'På sporet'
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

function GoalCard({ summary }: { summary: GoalSummary }) {
  return (
    <div className={`stat-card goal-progress-card goal-progress-card-${summary.tone}`}>
      <span className="stat-label">{summary.goal.title}</span>
      <span className="stat-value stat-value-lg">{Math.round(summary.progressPct)} %</span>
      <span className="stat-hint">
        {formatBudgetCurrency(summary.goal.currentAmount)} av {formatBudgetCurrency(summary.goal.targetAmount)}
      </span>
      <span className="stat-hint">{summary.guidance}</span>
    </div>
  )
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
