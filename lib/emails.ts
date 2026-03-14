export function confirmationEmail(email: string, language: string) {
  const isNo = language !== 'en'

  const subject = isNo
    ? 'Du er på ventelisten for CompoundIQ!'
    : 'You\'re on the CompoundIQ waitlist!'

  const html = isNo ? `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111">
      <h1 style="font-size:24px;margin-bottom:8px">Velkommen til CompoundIQ 🎉</h1>
      <p style="color:#555;margin-bottom:24px">Takk for at du meldte deg på! Du er nå på ventelisten.</p>
      <p>Vi gir deg beskjed så snart du får tilgang. CompoundIQ er bygget for norske investorer som ønsker smarte verktøy for langsiktig formuesbygging.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
      <p style="color:#888;font-size:13px">Du mottar denne e-posten fordi ${email} ble registrert på compoundiq.no.</p>
    </div>
  ` : `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111">
      <h1 style="font-size:24px;margin-bottom:8px">Welcome to CompoundIQ 🎉</h1>
      <p style="color:#555;margin-bottom:24px">Thanks for signing up — you're on the waitlist!</p>
      <p>We'll notify you as soon as you get access. CompoundIQ is built for Norwegian investors who want smart tools for long-term wealth building.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
      <p style="color:#888;font-size:13px">You received this because ${email} was registered at compoundiq.no.</p>
    </div>
  `

  return { subject, html }
}

export function notificationEmail(email: string, language: string) {
  return {
    subject: `New waitlist signup: ${email}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="margin-bottom:16px">New CompoundIQ signup</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Language:</strong> ${language}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      </div>
    `,
  }
}
