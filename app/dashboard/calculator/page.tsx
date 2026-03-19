import Calculator from '@/components/Calculator'

export default function DashboardCalculatorPage() {
  return (
    <div className="dash-page dashboard-calculator-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Kalkulator</h1>
          <p className="dash-subtitle">
            Juster forutsetningene dine og se utviklingen uten landingpage-oppsettet rundt.
          </p>
        </div>
      </div>
      <Calculator variant="dashboard" />
    </div>
  )
}
