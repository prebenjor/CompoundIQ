'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function InformasjonskapslerPage() {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1>Informasjonskapsler</h1>
            <p className="legal-updated">Sist oppdatert: 18. mars 2026</p>

            <section>
              <h2>1. Hva brukes</h2>
              <p>
                CompoundIQ bruker for oyeblikket ikke sporingscookies. Vi bruker localStorage for a
                huske sprakvalg og cookie-samtykke.
              </p>
            </section>

            <section>
              <h2>2. Nokkler som lagres lokalt</h2>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Nokkel</th>
                    <th>Formal</th>
                    <th>Verdi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>ciq-lang</code></td>
                    <td>Husker sprakvalg</td>
                    <td><code>no</code> eller <code>en</code></td>
                  </tr>
                  <tr>
                    <td><code>ciq-cookie-consent</code></td>
                    <td>Husker samtykkevalg</td>
                    <td><code>necessary</code> eller <code>all</code></td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2>3. Tredjepartsressurser</h2>
              <p>
                Nettsiden laster inn skrifter fra Google Fonts. Det betyr at nettleseren kobler
                seg til Googles servere ved sideinnlasting.
              </p>
            </section>

            <div className="legal-back">
              <Link href="/" className="btn btn-outline">Tilbake til forsiden</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
