export default function DashboardIntegrationsPage() {
  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Integrasjoner</h1>
          <p className="dash-subtitle">
            Neste steg bør være åpne data, bedre import/eksport og mer nyttig veiledning, ikke
            skjør broker-sync.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Åpne datakilder først</h2>
          <ul className="dash-checklist">
            <li>SSB for inflasjon, historiske nøkkeltall og makroserier.</li>
            <li>Norges Bank for styringsrente, valuta og offentlig statistikk.</li>
            <li>Skatteetaten for regler, satser og produktveiledning der deling er tilgjengelig.</li>
            <li>Brønnøysundregistrene for åpne virksomhetsdata og selskapssøk.</li>
          </ul>
        </div>
        <div className="dashboard-panel">
          <h2 className="dash-section-title">Status nå</h2>
          <p className="panel-copy">
            Porteføljesiden fungerer allerede med manuell registrering. Nærmeste leveranser bør
            være sterk CSV-import/eksport, åpne datakilder for innsikt og bedre forklaringer i
            produktet.
          </p>
        </div>
      </div>
    </div>
  )
}
