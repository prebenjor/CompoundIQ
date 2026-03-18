'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function VilkarPage() {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1>Vilkar for bruk</h1>
            <p className="legal-updated">Sist oppdatert: 18. mars 2026</p>

            <section>
              <h2>1. Om tjenesten</h2>
              <p>
                CompoundIQ er en webapplikasjon for kalkulasjon, scenarioanalyse og enkel
                portfolio-oversikt for norske investorer.
              </p>
            </section>

            <section>
              <h2>2. Ikke finansiell radgivning</h2>
              <p>
                Innholdet er laget for informasjon og planlegging. Det er ikke en anbefaling om a
                kjope, selge eller holde finansielle instrumenter.
              </p>
            </section>

            <section>
              <h2>3. Tilgjengelighet</h2>
              <p>
                Vi forbeholder oss retten til a endre eller fjerne funksjonalitet. Tjenesten
                leveres slik den star uten garantier for kontinuerlig tilgjengelighet.
              </p>
            </section>

            <section>
              <h2>4. Brukeransvar</h2>
              <ul>
                <li>Oppgi riktige opplysninger ved registrering.</li>
                <li>Ikke bruk tjenesten til ulovlige formal.</li>
                <li>Ikke forsok a fa uautorisert tilgang til systemer eller data.</li>
              </ul>
            </section>

            <section>
              <h2>5. Immaterielle rettigheter</h2>
              <p>
                Innhold, design og kode tilhorer CompoundIQ med mindre noe annet er oppgitt.
              </p>
            </section>

            <section>
              <h2>6. Kontakt</h2>
              <p>
                Sporsmal om disse vilkarene kan sendes til <a href="mailto:hei@compoundiq.no">hei@compoundiq.no</a>.
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
