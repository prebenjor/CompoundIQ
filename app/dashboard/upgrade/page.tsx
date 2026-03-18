import Link from 'next/link'

export default function DashboardUpgradePage() {
  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Oppgrader til Pro</h1>
          <p className="dash-subtitle">
            Denne siden gir oppgraderingslenkene et faktisk mål i stedet for en 404.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Gratis</h2>
          <ul className="dash-checklist">
            <li>Manuell portefølje</li>
            <li>Kalkulator og ASK/BSU-planner</li>
            <li>Lokale innstillinger i nettleseren</li>
          </ul>
        </div>
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Pro roadmap</h2>
          <ul className="dash-checklist">
            <li>Synkronisering mellom enheter</li>
            <li>Eksport til PDF og CSV</li>
            <li>Integrasjoner mot meglere og markedsdata</li>
          </ul>
          <Link href="/dashboard/integrations" className="btn btn-primary">
            Se hva som kommer
          </Link>
        </div>
      </div>
    </div>
  )
}
