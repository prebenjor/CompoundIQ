import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

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
      <body className={inter.className}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  )
}
