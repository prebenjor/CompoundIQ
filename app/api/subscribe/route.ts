import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { hasServerSupabaseEnv } from '@/lib/env'
import { confirmationEmail, notificationEmail } from '@/lib/emails'
import { createServerClient } from '@/lib/supabase'

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

  if (!hasServerSupabaseEnv()) {
    return NextResponse.json(
      { error: 'Waitlist storage is not configured yet' },
      { status: 503 }
    )
  }

  const supabase = createServerClient()
  const { error } = await supabase.from('waitlist').insert({ email, language })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ duplicate: true }, { status: 200 })
    }

    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ success: true }, { status: 200 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.EMAIL_FROM ?? 'CompoundIQ <onboarding@resend.dev>'
  const sends = [
    resend.emails.send({
      from,
      to: email,
      ...confirmationEmail(email, language),
    }),
  ]

  if (process.env.NOTIFY_ADDRESS) {
    sends.push(
      resend.emails.send({
        from,
        to: process.env.NOTIFY_ADDRESS,
        ...notificationEmail(email, language),
      })
    )
  }

  const emailResults = await Promise.allSettled(sends)

  emailResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Email ${index} failed:`, result.reason)
    } else if (result.value.error) {
      console.error(`Email ${index} error:`, result.value.error)
    }
  })

  return NextResponse.json({ success: true }, { status: 200 })
}
