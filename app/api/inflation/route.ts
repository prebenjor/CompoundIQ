import { NextResponse } from 'next/server'

// SSB table 03013: Konsumprisindeksen (KPI)
// Returns the latest 12-month CPI change for Norway
const SSB_URL = 'https://data.ssb.no/api/v0/no/table/03013/'

const SSB_QUERY = {
  query: [
    {
      code: 'Konsumgrp',
      selection: { filter: 'item', values: ['TOTAL'] },
    },
    {
      code: 'ContentsCode',
      selection: { filter: 'item', values: ['Tolvmanedersendring'] },
    },
    {
      code: 'Tid',
      selection: { filter: 'top', values: ['1'] },
    },
  ],
  response: { format: 'json-stat2' },
}

export async function GET() {
  try {
    const res = await fetch(SSB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(SSB_QUERY),
      // Cache for 1 hour — CPI is published monthly
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error(`SSB responded ${res.status}`)

    const data = await res.json()

    const rate: number = data.value[0]
    const period: string = Object.keys(data.dimension.Tid.category.index)[0]

    if (typeof rate !== 'number' || isNaN(rate)) throw new Error('Invalid value')

    return NextResponse.json({ rate, period })
  } catch (err) {
    console.error('SSB inflation fetch failed:', err)
    return NextResponse.json({ error: 'Could not fetch inflation data' }, { status: 502 })
  }
}
