'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function VilkarPage() {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1>Vilkår for bruk</h1>
            <p className="legal-updated">Sist oppdatert: 16. mars 2026</p>

            <section>
              <h2>1. Om tjenesten</h2>
              <p>
                CompoundIQ er en webapplikasjon som tilbyr verktøy for å visualisere og analysere
                investeringer, inkludert rentesammensetningskalkulator, porteføljeanalyse og
                markedsinformasjon tilpasset det norske markedet. Tjenesten er for øyeblikket i en
                tidlig fase, og tilgang skjer via venteliste.
              </p>
              <p>
                Ved å melde deg på ventelisten eller bruke tjenesten godtar du disse vilkårene.
              </p>
            </section>

            <section>
              <h2>2. Ikke finansiell rådgivning</h2>
              <p>
                <strong>
                  CompoundIQ er ikke en finansiell rådgiver og tilbyr ikke finansiell rådgivning,
                  investeringsanbefalinger eller forvaltning av midler.
                </strong>
              </p>
              <p>
                Alt innhold, alle kalkulatorer, beregninger, prognoser og data som presenteres i
                tjenesten er utelukkende ment som informasjon og pedagogisk verktøy. Ingenting på
                denne nettsiden skal forstås som en anbefaling om kjøp, salg eller holding av
                verdipapirer eller andre finansielle instrumenter.
              </p>
              <p>
                CompoundIQ er ikke konsesjonspliktig etter verdipapirhandelloven og er ikke
                underlagt tilsyn fra Finanstilsynet som investeringstjenesteyter. Historisk
                avkastning er ingen garanti for fremtidig avkastning. Alle investeringer medfører
                risiko, og du kan tape hele eller deler av investert beløp.
              </p>
              <p>
                Vi anbefaler at du søker råd fra en autorisert finansrådgiver eller annen kvalifisert
                fagperson before du tar investeringsbeslutninger.
              </p>
            </section>

            <section>
              <h2>3. Nøyaktighet og tilgjengelighet</h2>
              <p>
                Vi bestreber oss på å presentere korrekt og oppdatert informasjon, men gir ingen
                garanti for nøyaktigheten, fullstendigheten eller aktualiteten til data som vises i
                tjenesten, inkludert kurser fra Oslo Børs og øvrig markedsinformasjon.
              </p>
              <p>
                Tjenesten leveres «som den er» og vi forbeholder oss retten til å endre, suspendere
                eller avslutte hele eller deler av tjenesten uten forhåndsvarsel. Vi er ikke ansvarlige
                for eventuell nedetid eller datatap.
              </p>
            </section>

            <section>
              <h2>4. Ansvarsbegrensning</h2>
              <p>
                I den grad det er tillatt etter gjeldende lov, er CompoundIQ ikke ansvarlig for
                direkte, indirekte, tilfeldige eller følgeskader som oppstår som følge av bruk av
                eller manglende mulighet til å bruke tjenesten, herunder tap av inntekt, fortjeneste
                eller data.
              </p>
            </section>

            <section>
              <h2>5. Brukernes forpliktelser</h2>
              <p>Du forplikter deg til å:</p>
              <ul>
                <li>Oppgi korrekte opplysninger ved påmelding til ventelisten.</li>
                <li>Ikke misbruke tjenesten til ulovlige formål.</li>
                <li>
                  Ikke forsøke å få uautorisert tilgang til systemer, databaser eller andres
                  kontoer.
                </li>
                <li>
                  Ikke benytte automatiserte metoder (skraping, roboter o.l.) uten skriftlig
                  tillatelse.
                </li>
              </ul>
            </section>

            <section>
              <h2>6. Immaterielle rettigheter</h2>
              <p>
                Alt innhold på nettsiden – tekst, grafikk, logoer, kode og design – tilhører
                CompoundIQ og er beskyttet av opphavsretten. Du kan ikke reprodusere, distribuere
                eller benytte innholdet kommersielt uten skriftlig tillatelse.
              </p>
            </section>

            <section>
              <h2>7. Personvern</h2>
              <p>
                Behandlingen av personopplysninger er beskrevet i vår{' '}
                <a href="/personvern" className="legal-link">
                  personvernerklæring
                </a>
                .
              </p>
            </section>

            <section>
              <h2>8. Endringer i vilkårene</h2>
              <p>
                Vi kan oppdatere disse vilkårene. Ved vesentlige endringer varsler vi registrerte
                brukere per e-post. Fortsatt bruk av tjenesten etter at endringer er trådt i kraft,
                anses som aksept av de nye vilkårene.
              </p>
            </section>

            <section>
              <h2>9. Lovvalg og verneting</h2>
              <p>
                Disse vilkårene er underlagt norsk rett. Eventuelle tvister skal søkes løst
                i minnelighet. Dersom det ikke oppnås enighet, er Oslo tingrett verneting.
              </p>
            </section>

            <section>
              <h2>10. Kontakt</h2>
              <p>
                Spørsmål om disse vilkårene kan rettes til{' '}
                <a href="mailto:hei@compoundiq.no">hei@compoundiq.no</a>.
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
