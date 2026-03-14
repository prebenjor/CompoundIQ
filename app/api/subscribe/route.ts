import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase'
import { confirmationEmail, notificationEmail } from '@/lib/emails'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NOTIFY_ADDRESS = 'preben.joergensen94@gmail.com'

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
    if (error.code === '23505') {
      return NextResponse.json({ duplicate: true }, { status: 200 })
    }
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  await Promise.allSettled([
    resend.emails.send({
      from: 'CompoundIQ <noreply@compoundiq.no>',
      to: email,
      ...confirmationEmail(email, language),
    }),
    resend.emails.send({
      from: 'CompoundIQ <noreply@compoundiq.no>',
      to: NOTIFY_ADDRESS,
      ...notificationEmail(email, language),
    }),
  ])

  return NextResponse.json({ success: true }, { status: 200 })
}
