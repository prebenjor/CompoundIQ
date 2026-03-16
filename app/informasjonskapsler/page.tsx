'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function InformasjonskapselPage() {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1>Informasjonskapselregler</h1>
            <p className="legal-updated">Sist oppdatert: 16. mars 2026</p>

            <section>
              <h2>1. Hva er informasjonskapsler?</h2>
              <p>
                Informasjonskapsler (cookies) er små tekstfiler som lagres i nettleseren din når
                du besøker en nettside. De brukes til å huske preferanser, analysere trafikk og
                tilpasse innhold.
              </p>
            </section>

            <section>
              <h2>2. Bruker CompoundIQ informasjonskapsler?</h2>
              <p>
                CompoundIQ bruker for øyeblikket <strong>ingen informasjonskapsler</strong> (cookies)
                for sporing, analyse eller markedsføring. I stedet bruker vi nettleserens{' '}
                <code>localStorage</code> for å lagre preferanser lokalt på din enhet.
              </p>
              <p>
                I motsetning til cookies sendes ikke localStorage-data automatisk til serveren vår
                ved hver sideinnlasting.
              </p>
            </section>

            <section>
              <h2>3. Lokal lagring (localStorage)</h2>
              <p>Vi bruker localStorage til følgende:</p>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Nøkkel</th>
                    <th>Formål</th>
                    <th>Verdi</th>
                    <th>Deles med tredjeparter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>ciq-lang</code></td>
                    <td>Huske ditt språkvalg (norsk/engelsk)</td>
                    <td><code>no</code> eller <code>en</code></td>
                    <td>Nei</td>
                  </tr>
                  <tr>
                    <td><code>ciq-cookie-consent</code></td>
                    <td>Huske ditt samtykkevalg slik at banneret ikke vises igjen</td>
                    <td><code>necessary</code> eller <code>all</code></td>
                    <td>Nei</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Disse dataene lagres utelukkende i nettleseren din og forlater ikke enheten din.
                Du kan slette dem når som helst under nettleserens innstillinger.
              </p>
            </section>

            <section>
              <h2>4. Tredjepartstjenester</h2>
              <p>
                Nettsiden laster inn skrifter (fonter) fra <strong>Google Fonts</strong>. Dette
                betyr at nettleseren din oppretter en tilkobling til Googles servere ved
                sideinnlasting, og at IP-adressen din kan bli behandlet av Google i henhold til
                deres personvernregler. Google Fonts-forespørselen sendes uten
                informasjonskapsler fra vår side.
              </p>
              <p>
                Vi bruker for øyeblikket ingen analyse-, reklame- eller sporingsverktøy fra
                tredjeparter (f.eks. Google Analytics, Facebook Pixel).
              </p>
            </section>

            <section>
              <h2>5. Fremtidige endringer</h2>
              <p>
                Dersom vi i fremtiden innfører analyse- eller ytelsestjenester som bruker
                informasjonskapsler, vil vi oppdatere denne siden og be om ditt samtykke i henhold
                til ekomloven og GDPR.
              </p>
            </section>

            <section>
              <h2>6. Slik sletter du lokal lagring</h2>
              <p>
                Du kan fjerne localStorage-data i nettleseren din:
              </p>
              <ul>
                <li>
                  <strong>Chrome/Edge:</strong> Innstillinger → Personvern og sikkerhet →
                  Slett nettleserdata → Lagrede data og filer
                </li>
                <li>
                  <strong>Firefox:</strong> Innstillinger → Personvern og sikkerhet →
                  Informasjonskapsler og nettstedsdata → Administrer data
                </li>
                <li>
                  <strong>Safari:</strong> Innstillinger → Personvern → Administrer
                  nettsteddata
                </li>
              </ul>
            </section>

            <section>
              <h2>7. Kontakt</h2>
              <p>
                Spørsmål om vår bruk av informasjonskapsler og lokal lagring kan rettes til{' '}
                <a href="mailto:personvern@compoundiq.no">personvern@compoundiq.no</a>.
              </p>
            </section>

            <div className="legal-back">
              <a href="/" className="btn btn-outline">← Tilbake til forsiden</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
