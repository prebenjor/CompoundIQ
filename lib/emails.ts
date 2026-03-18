function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function confirmationEmail(email: string, language: string) {
  const isNorwegian = language !== 'en'
  const safeEmail = escapeHtml(email)

  const subject = isNorwegian
    ? 'Du er på ventelisten for CompoundIQ!'
    : "You're on the CompoundIQ waitlist!"

  const html = isNorwegian
    ? `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111">
        <h1 style="font-size:24px;margin-bottom:8px">Velkommen til CompoundIQ</h1>
        <p style="color:#555;margin-bottom:24px">Takk for at du meldte deg på. Du er nå på ventelisten.</p>
        <p>Vi gir deg beskjed så snart du får tilgang. CompoundIQ er laget for norske investorer som vil ha smarte verktøy for langsiktig formuesbygging.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
        <p style="color:#888;font-size:13px">Du mottar denne e-posten fordi ${safeEmail} ble registrert på compoundiq.no.</p>
      </div>
    `
    : `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111">
        <h1 style="font-size:24px;margin-bottom:8px">Welcome to CompoundIQ</h1>
        <p style="color:#555;margin-bottom:24px">Thanks for signing up. You're on the waitlist.</p>
        <p>We will notify you as soon as access opens up. CompoundIQ is built for Norwegian investors who want better long-term planning tools.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
        <p style="color:#888;font-size:13px">You received this because ${safeEmail} was registered at compoundiq.no.</p>
      </div>
    `

  return { subject, html }
}

export function notificationEmail(email: string, language: string) {
  const safeEmail = escapeHtml(email)
  const safeLanguage = escapeHtml(language)

  return {
    subject: `New waitlist signup: ${email}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="margin-bottom:16px">New CompoundIQ signup</h2>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Language:</strong> ${safeLanguage}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      </div>
    `,
  }
}
