export default function DashboardIntegrationsPage() {
  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Integrasjoner</h1>
          <p className="dash-subtitle">
            Dette er neste naturlige steg etter manuell portfolio. Siden viser hva som er pa vei.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Planlagte koblinger</h2>
          <ul className="dash-checklist">
            <li>Nordnet-import fra CSV-eksport som forste leveranse.</li>
            <li>Automatisk kursoppdatering for manuelle beholdninger.</li>
            <li>Enkel statusvisning for siste synkronisering.</li>
          </ul>
        </div>
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Status na</h2>
          <p className="panel-copy">
            Integrasjonene er ikke koblet til ennå, men portefoljesiden fungerer allerede med
            manuell registrering.
          </p>
        </div>
      </div>
    </div>
  )
}
