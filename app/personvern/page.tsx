'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PersonvernPage() {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1>Personvernerklæring</h1>
            <p className="legal-updated">Sist oppdatert: 16. mars 2026</p>

            <section>
              <h2>1. Behandlingsansvarlig</h2>
              <p>
                CompoundIQ er behandlingsansvarlig for personopplysninger som samles inn via denne
                tjenesten. Har du spørsmål om personvern, ta kontakt på{' '}
                <a href="mailto:personvern@compoundiq.no">personvern@compoundiq.no</a>.
              </p>
            </section>

            <section>
              <h2>2. Personopplysninger vi behandler</h2>
              <p>Vi samler inn og behandler følgende personopplysninger:</p>
              <ul>
                <li>
                  <strong>E-postadresse</strong> – oppgitt frivillig når du melder deg på
                  ventelisten.
                </li>
                <li>
                  <strong>Språkpreferanse</strong> – lagres lokalt i nettleseren din
                  (localStorage), ikke på våre servere.
                </li>
                <li>
                  <strong>Påmeldingstidspunkt</strong> – tidsstempel for når du meldte deg på
                  ventelisten.
                </li>
              </ul>
              <p>
                Vi samler ikke inn navn, adresse, telefonnummer, betalingsinformasjon eller annen
                sensitiv informasjon.
              </p>
            </section>

            <section>
              <h2>3. Formål og behandlingsgrunnlag</h2>
              <p>
                Vi behandler e-postadressen din utelukkende for å administrere ventelisten og
                varsle deg når CompoundIQ lanseres. Behandlingsgrunnlaget er ditt{' '}
                <strong>samtykke</strong> (GDPR art. 6 nr. 1 bokstav a), som du gir ved å melde
                deg på ventelisten.
              </p>
              <p>
                Du kan når som helst trekke tilbake samtykket ved å kontakte oss (se punkt 7).
                Tilbaketrekking påvirker ikke lovligheten av behandlingen som har skjedd før
                tilbaketrekket.
              </p>
            </section>

            <section>
              <h2>4. Databehandlere og overføring til tredjeland</h2>
              <p>Vi benytter følgende databehandlere:</p>
              <ul>
                <li>
                  <strong>Supabase Inc.</strong> (USA) – databaselagring av ventelisteopplysninger.
                  Supabase er sertifisert under EU–US Data Privacy Framework, og all behandling
                  skjer i samsvar med GDPR og nødvendige garantier etter personopplysningsloven.
                </li>
                <li>
                  <strong>Resend Inc.</strong> (USA) – utsendelse av bekreftelsese-post. Resend
                  behandler e-postadressen din i forbindelse med e-postlevering.
                </li>
              </ul>
              <p>
                Det er inngått databehandleravtaler med begge leverandørene. Overføring til USA er
                dekket av standardkontraktsklausuler (SCC) i henhold til GDPR art. 46.
              </p>
            </section>

            <section>
              <h2>5. Lagringstid</h2>
              <p>
                Vi lagrer e-postadressen din inntil ett av følgende inntreffer:
              </p>
              <ul>
                <li>Du ber om sletting (se punkt 7).</li>
                <li>Ventelisten avsluttes i forbindelse med produktlansering, og vi ikke lenger
                  har et legitimt formål med å beholde dataene.</li>
              </ul>
            </section>

            <section>
              <h2>6. Informasjonskapsler og lokal lagring</h2>
              <p>
                Denne nettsiden bruker <strong>ikke</strong> informasjonskapsler (cookies) for
                sporing eller analyse. Vi bruker nettleserens localStorage utelukkende for å lagre:
              </p>
              <ul>
                <li>
                  <code>ciq-lang</code> – ditt språkvalg (norsk/engelsk).
                </li>
                <li>
                  <code>ciq-cookie-consent</code> – ditt samtykkevalg for informasjonskapsler.
                </li>
              </ul>
              <p>
                Disse dataene forlater aldri nettleseren din og deles ikke med oss eller
                tredjeparter. Du kan slette dem når som helst via nettleserens innstillinger.
              </p>
              <p>
                Nettsiden laster inn skrifter fra Google Fonts. Dette innebærer en tilkobling til
                Googles servere ved sideinnlasting.{' '}
                <a
                  href="/informasjonskapsler"
                  className="legal-link"
                >
                  Les mer i vår informasjonskapselregler.
                </a>
              </p>
            </section>

            <section>
              <h2>7. Dine rettigheter</h2>
              <p>
                Etter personopplysningsloven og GDPR har du følgende rettigheter:
              </p>
              <ul>
                <li>
                  <strong>Innsyn</strong> – du kan be om en kopi av personopplysningene vi
                  behandler om deg.
                </li>
                <li>
                  <strong>Retting</strong> – du kan be oss rette feilaktige opplysninger.
                </li>
                <li>
                  <strong>Sletting</strong> – du kan be oss slette personopplysningene dine.
                </li>
                <li>
                  <strong>Dataportabilitet</strong> – du kan be om å få utlevert
                  personopplysningene dine i et maskinlesbart format.
                </li>
                <li>
                  <strong>Trekke tilbake samtykke</strong> – du kan trekke tilbake samtykket
                  ditt når som helst uten negative konsekvenser.
                </li>
              </ul>
              <p>
                Send en e-post til{' '}
                <a href="mailto:personvern@compoundiq.no">personvern@compoundiq.no</a> for å
                utøve rettighetene dine. Vi svarer innen 30 dager.
              </p>
            </section>

            <section>
              <h2>8. Klage til Datatilsynet</h2>
              <p>
                Hvis du mener vi behandler personopplysningene dine i strid med regelverket, har
                du rett til å klage til{' '}
                <a
                  href="https://www.datatilsynet.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="legal-link"
                >
                  Datatilsynet
                </a>{' '}
                (datatilsynet.no). Vi oppfordrer deg likevel til å kontakte oss først, slik at vi
                kan rette eventuelle feil.
              </p>
            </section>

            <section>
              <h2>9. Endringer i personvernerklæringen</h2>
              <p>
                Vi kan oppdatere denne erklæringen. Vesentlige endringer vil varsles per e-post
                til registrerte brukere. Gjeldende versjon er alltid tilgjengelig på denne siden.
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
