import Calculator from '@/components/Calculator'

export default function DashboardCalculatorPage() {
  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Kalkulator</h1>
          <p className="dash-subtitle">
            Samme renters rente-kalkulator som pa forsiden, tilgjengelig direkte i dashboardet.
          </p>
        </div>
      </div>
      <Calculator />
    </div>
  )
}
