import Link from 'next/link'

export default function DashboardUpgradePage() {
  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Oppgrader til Pro</h1>
          <p className="dash-subtitle">
            Gratisplanen skal være nyttig alene. Pro skal være billigere og tydelig mer verdifull.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Gratis</h2>
          <ul className="dash-checklist">
            <li>Manuell portefølje og kalkulator for ASK, fond/aksjer og bank</li>
            <li>ASK/BSU-planner, realverdi, uttak og scenario-sammenligning</li>
            <li>Import av CSV/JSON og eksport til CSV, XLSX og PDF</li>
            <li>Lokal lagring av flere scenarioer og standardinnstillinger</li>
            <li>Én budsjettarbeidsflate inkludert</li>
          </ul>
        </div>
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Pro til 29 kr/mnd</h2>
          <ul className="dash-checklist">
            <li>Synkronisering mellom enheter og ubegrensede porteføljer</li>
            <li>Bedre CSV-import, delbare lenker og sterkere eksportflyt</li>
            <li>Eksport til PDF, CSV, JSON og XLSX med rapportmaler</li>
            <li>Åpne data-innsikter, målsporing, varsler og husstandsdeling</li>
          </ul>
          <Link href="/dashboard/integrations" className="btn btn-primary">
            Se hva som kommer
          </Link>
        </div>
      </div>
    </div>
  )
}
