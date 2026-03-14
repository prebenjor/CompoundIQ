import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const runtime = 'edge'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let email: string
  let language: string

  try {
    const body = await req.json()
    email = (body.email ?? '').toString().trim().toLowerCase()
    language = (body.language ?? 'no').toString()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { error } = await supabase
    .from('waitlist')
    .insert({ email, language })

  if (error) {
    // Unique constraint violation → already on the list
    if (error.code === '23505') {
      return NextResponse.json({ duplicate: true }, { status: 200 })
    }
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
