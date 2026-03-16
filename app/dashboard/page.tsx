import { createSupabaseServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.email?.split('@')[0] ?? 'investor'

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Hei, {displayName} 👋</h1>
          <p className="dash-subtitle">Her er oversikten din</p>
        </div>
        <Link href="/dashboard/portfolio/new" className="btn btn-primary">
          + Legg til portefølje
        </Link>
      </div>

      {/* Stats row */}
      <div className="dash-stats">
        <StatCard
          label="Total porteføljeverdi"
          value="—"
          change={null}
          hint="Koble til Nordnet eller legg til manuelt"
        />
        <StatCard
          label="Total avkastning"
          value="—"
          change={null}
          hint="Basert på kostpris vs. nåverdi"
        />
        <StatCard
          label="Estimert vekst (10 år)"
          value="—"
          change={null}
          hint="Bruk kalkulatoren for å beregne"
        />
        <StatCard
          label="ASK-utnyttelse"
          value="—"
          change={null}
          hint="Optimaliser skattefordelene dine"
        />
      </div>

      {/* Quick actions */}
      <div className="dash-section">
        <h2 className="dash-section-title">Kom i gang</h2>
        <div className="dash-cards">
          <QuickCard
            icon="📊"
            title="Kalkulator"
            desc="Beregn renters rente og projiser veksten din over tid."
            href="/dashboard/calculator"
            cta="Åpne kalkulator"
          />
          <QuickCard
            icon="💼"
            title="Portefølje"
            desc="Legg til aksjer og fond manuelt eller koble til Nordnet."
            href="/dashboard/portfolio"
            cta="Se portefølje"
          />
          <QuickCard
            icon="🏦"
            title="ASK & BSU"
            desc="Optimaliser skattefordelene dine med ASK- og BSU-kalkulatoren."
            href="/dashboard/ask-bsu"
            cta="Beregn nå"
          />
          <QuickCard
            icon="🔗"
            title="Nordnet"
            desc="Koble til Nordnet for automatisk import av portefølje og kursdata."
            href="/dashboard/integrations"
            cta="Koble til"
            badge="Kommer snart"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  change,
  hint,
}: {
  label: string
  value: string
  change: number | null
  hint: string
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {change !== null ? (
        <span className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      ) : (
        <span className="stat-hint">{hint}</span>
      )}
    </div>
  )
}

function QuickCard({
  icon,
  title,
  desc,
  href,
  cta,
  badge,
}: {
  icon: string
  title: string
  desc: string
  href: string
  cta: string
  badge?: string
}) {
  return (
    <div className="quick-card">
      <div className="quick-card-icon">{icon}</div>
      <div className="quick-card-body">
        <div className="quick-card-title-row">
          <h3>{title}</h3>
          {badge && <span className="badge-soon">{badge}</span>}
        </div>
        <p>{desc}</p>
      </div>
      <Link href={href} className={`btn btn-ghost quick-card-btn${badge ? ' disabled' : ''}`}>
        {cta}
      </Link>
    </div>
  )
}
