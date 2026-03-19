import { fetchBudgetSavingsThread, formatBudgetCurrency, type BudgetSavingsThread } from '@/lib/budget-data'
import { fetchDashboardSettingsBundle, getDataErrorMessage } from '@/lib/dashboard-data'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export type GoalType = 'emergency_fund' | 'bsu_annual'
export type GoalStatus = 'active' | 'completed' | 'paused'

export interface UserGoal {
  id: string
  type: GoalType
  title: string
  targetAmount: number
  currentAmount: number
  targetDate: string | null
  status: GoalStatus
  priority: number
}

export interface GoalSummary {
  goal: UserGoal
  progressPct: number
  remainingAmount: number
  recommendedMonthly: number
  dedicatedMonthly: number
  flexibleMonthly: number
  projectedMonths: number | null
  projectedDateLabel: string | null
  isOnTrack: boolean
  tone: 'positive' | 'warning' | 'neutral'
  guidance: string
}

interface GoalRow {
  id: string
  user_id: string
  goal_type: GoalType
  title: string
  target_amount: number
  current_amount: number
  target_date: string | null
  status: GoalStatus
  priority: number
}

function toIsoLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

function endOfYearIso() {
  const now = new Date()
  return `${now.getFullYear()}-12-31`
}

function defaultGoalSeed(bsuEnabled: boolean) {
  const now = new Date()

  return [
    {
      goal_type: 'emergency_fund' as const,
      title: 'Nødbuffer',
      target_amount: 100000,
      current_amount: 0,
      target_date: toIsoLocalDate(addMonths(now, 12)),
      status: 'active' as const,
      priority: 10,
    },
    ...(bsuEnabled
      ? [
          {
            goal_type: 'bsu_annual' as const,
            title: `BSU ${now.getFullYear()}`,
            target_amount: 27500,
            current_amount: 0,
            target_date: endOfYearIso(),
            status: 'active' as const,
            priority: 20,
          },
        ]
      : []),
  ]
}

function mapGoal(row: GoalRow): UserGoal {
  return {
    id: row.id,
    type: row.goal_type,
    title: row.title,
    targetAmount: Number(row.target_amount ?? 0),
    currentAmount: Number(row.current_amount ?? 0),
    targetDate: row.target_date,
    status: row.status,
    priority: Number(row.priority ?? 0),
  }
}

async function getAuthenticatedGoalsClient() {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('Du må være logget inn for å hente mål.')
  }

  return { supabase, user }
}

export async function fetchUserGoals() {
  const [{ supabase, user }, bundle] = await Promise.all([
    getAuthenticatedGoalsClient(),
    fetchDashboardSettingsBundle(),
  ])
  const result = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })

  if (result.error) {
    throw result.error
  }

  let rows = (result.data ?? []) as GoalRow[]
  const missingSeeds = defaultGoalSeed(bundle.settings.bsuEnabled).filter(
    (seed) => !rows.some((row) => row.goal_type === seed.goal_type)
  )

  if (missingSeeds.length > 0) {
    const insertResult = await supabase
      .from('user_goals')
      .insert(
        missingSeeds.map((goal) => ({
          user_id: user.id,
          ...goal,
        }))
      )
      .select('*')

    if (insertResult.error) {
      throw insertResult.error
    }

    rows = [...rows, ...((insertResult.data ?? []) as GoalRow[])]
  }

  const filteredRows = bundle.settings.bsuEnabled
    ? rows
    : rows.filter((row) => row.goal_type !== 'bsu_annual')

  return filteredRows.map(mapGoal).sort((left, right) => left.priority - right.priority)
}

export async function updateUserGoal(goalId: string, updates: Partial<UserGoal>) {
  const { supabase, user } = await getAuthenticatedGoalsClient()
  const payload: Record<string, unknown> = {}

  if (updates.title !== undefined) {
    payload.title = updates.title
  }
  if (updates.targetAmount !== undefined) {
    payload.target_amount = updates.targetAmount
  }
  if (updates.currentAmount !== undefined) {
    payload.current_amount = updates.currentAmount
  }
  if (updates.targetDate !== undefined) {
    payload.target_date = updates.targetDate
  }
  if (updates.status !== undefined) {
    payload.status = updates.status
  }
  if (updates.priority !== undefined) {
    payload.priority = updates.priority
  }

  const result = await supabase
    .from('user_goals')
    .update(payload)
    .eq('id', goalId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (result.error) {
    throw result.error
  }

  return mapGoal(result.data as GoalRow)
}

function formatMonthYear(dateIso: string) {
  return new Intl.DateTimeFormat('nb-NO', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateIso}T00:00:00`))
}

function monthsUntil(targetDate: string) {
  const now = new Date()
  const target = new Date(`${targetDate}T00:00:00`)
  const rawMonths =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())

  return Math.max(0, rawMonths + 1)
}

export function deriveGoalSummaries(
  goals: UserGoal[],
  budgetThread: BudgetSavingsThread | null
): GoalSummary[] {
  const sortedGoals = [...goals].sort((left, right) => left.priority - right.priority)
  let remainingFlexibleSlack = budgetThread?.availableGeneralSavings ?? 0

  return sortedGoals.map((goal) => {
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount)
    const progressPct =
      goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0
    const dedicatedMonthly =
      goal.type === 'emergency_fund'
        ? budgetThread?.availableToBuffer ?? 0
        : budgetThread?.availableToBsu ?? 0
    const flexibleMonthly =
      goal.status === 'active' && remainingAmount > 0
        ? Math.min(remainingFlexibleSlack, remainingAmount)
        : 0

    remainingFlexibleSlack = Math.max(0, remainingFlexibleSlack - flexibleMonthly)

    const recommendedMonthly = dedicatedMonthly + flexibleMonthly
    const projectedMonths =
      remainingAmount > 0 && recommendedMonthly > 0
        ? Math.ceil(remainingAmount / recommendedMonthly)
        : null
    const projectedDate =
      projectedMonths !== null ? addMonths(new Date(), projectedMonths - 1) : null
    const projectedDateLabel = projectedDate ? formatMonthYear(toIsoLocalDate(projectedDate)) : null
    const monthsToTargetDate = goal.targetDate ? monthsUntil(goal.targetDate) : null
    const isOnTrack =
      remainingAmount === 0 ||
      (projectedMonths !== null && monthsToTargetDate !== null
        ? projectedMonths <= monthsToTargetDate
        : recommendedMonthly > 0)

    let guidance = 'Sett opp budsjettet for å få et bedre forslag til månedlig fremdrift.'
    let tone: 'positive' | 'warning' | 'neutral' = 'neutral'

    if (remainingAmount === 0) {
      guidance = 'Målet er nådd. Du kan øke målet eller flytte kapasitet til neste prioritet.'
      tone = 'positive'
    } else if (recommendedMonthly <= 0) {
      guidance = 'Det er ingen månedlig kapasitet satt av til dette målet akkurat nå.'
      tone = 'warning'
    } else if (goal.targetDate && isOnTrack) {
      guidance = `Du ligger an til å nå målet innen ${formatMonthYear(goal.targetDate)}.`
      tone = 'positive'
    } else if (goal.targetDate && !isOnTrack) {
      guidance = `Med dagens tempo ligger målet etter planen mot ${formatMonthYear(goal.targetDate)}.`
      tone = 'warning'
    } else if (projectedDateLabel) {
      guidance = `Med dagens tempo kan målet nås rundt ${projectedDateLabel}.`
      tone = 'neutral'
    }

    if (flexibleMonthly > 0) {
      guidance = `${guidance} ${formatBudgetCurrency(
        flexibleMonthly
      )} av fritt overskudd går hit automatisk fordi målet har prioritet ${goal.priority}.`
    }

    return {
      goal,
      progressPct,
      remainingAmount,
      recommendedMonthly,
      dedicatedMonthly,
      flexibleMonthly,
      projectedMonths,
      projectedDateLabel,
      isOnTrack,
      tone,
      guidance,
    }
  })
}

export async function fetchGoalDashboardData() {
  const [goals, budgetThread] = await Promise.all([
    fetchUserGoals(),
    fetchBudgetSavingsThread().catch(() => null),
  ])

  return {
    goals,
    budgetThread,
    summaries: deriveGoalSummaries(goals, budgetThread),
  }
}

export function getGoalErrorMessage(message?: string) {
  return getDataErrorMessage(message)
}
