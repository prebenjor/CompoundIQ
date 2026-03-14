import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'CompoundIQ — Invester smartere i det norske markedet',
  description:
    'Kraftige investeringsverktøy for det norske markedet. Nordnet-integrasjon, Oslo Børs-data, rentesammensetningskalkulator og mer.',
  keywords: ['investering', 'Nordnet', 'Oslo Børs', 'rente', 'ASK', 'BSU', 'kalkulator'],
  openGraph: {
    title: 'CompoundIQ — Invester smartere i Norge',
    description: 'Porteføljeanalyse og investeringsverktøy for norske investorer.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  )
}
