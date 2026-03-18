'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function PersonvernPage() {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1>Personvernerklaring</h1>
            <p className="legal-updated">Sist oppdatert: 18. mars 2026</p>

            <section>
              <h2>1. Behandlingsansvarlig</h2>
              <p>
                CompoundIQ er behandlingsansvarlig for personopplysninger som samles inn via denne
                tjenesten. Kontakt oss pa <a href="mailto:personvern@compoundiq.no">personvern@compoundiq.no</a>.
              </p>
            </section>

            <section>
              <h2>2. Hvilke opplysninger vi behandler</h2>
              <ul>
                <li>E-postadresse hvis du melder deg pa ventelisten.</li>
                <li>Sprakvalg og cookie-samtykke i localStorage i nettleseren.</li>
                <li>Tidsstempel for venteliste-registrering.</li>
              </ul>
            </section>

            <section>
              <h2>3. Formal</h2>
              <p>
                Opplysningene brukes til a administrere ventelisten, sende relevant informasjon om
                lansering og drifte tjenesten pa en trygg mate.
              </p>
            </section>

            <section>
              <h2>4. Databehandlere</h2>
              <p>
                Vi bruker Supabase til lagring og Resend til utsendelse av e-post. Dersom vi
                bruker andre leverandorer senere, oppdaterer vi denne siden.
              </p>
            </section>

            <section>
              <h2>5. Lagringstid</h2>
              <p>
                Vi lagrer ventelistedata sa lenge det er nodvendig for a administrere lanseringen
                eller til du ber om sletting.
              </p>
            </section>

            <section>
              <h2>6. Dine rettigheter</h2>
              <p>
                Du kan be om innsyn, retting eller sletting av personopplysningene dine ved a ta
                kontakt pa e-postadressen over.
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
