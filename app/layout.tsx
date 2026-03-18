import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { LangProvider } from '@/lib/i18n'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CompoundIQ - Invester smartere i det norske markedet',
  description:
    'Kraftige investeringsverktoy for det norske markedet. Nordnet-integrasjon, Oslo Bors-data og renterente-kalkulator.',
  keywords: ['investering', 'Nordnet', 'Oslo Bors', 'rente', 'ASK', 'BSU', 'kalkulator'],
  openGraph: {
    title: 'CompoundIQ - Invester smartere i Norge',
    description: 'Portefoljeanalyse og investeringsverktoy for norske investorer.',
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
