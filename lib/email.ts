import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

interface ContactEmailData {
  name: string
  company: string
  email: string
  phone: string
  service: string
  message: string
}

export async function sendContactEmail(data: ContactEmailData) {
  const to = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@3ccore.com'

  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: `New enquiry from ${data.name} — ${data.service}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#050d1a;color:#c8dff0;padding:32px;border-radius:12px;">
        <h2 style="color:#ffffff;margin-bottom:8px;">New Enquiry — 3C Core</h2>
        <hr style="border-color:#1e3a5f;margin-bottom:24px;"/>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#7aaecc;width:140px;">Name</td><td style="padding:8px 0;color:#ffffff;">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#7aaecc;">Company</td><td style="padding:8px 0;color:#ffffff;">${data.company || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#7aaecc;">Email</td><td style="padding:8px 0;color:#00ccff;">${data.email}</td></tr>
          <tr><td style="padding:8px 0;color:#7aaecc;">Phone</td><td style="padding:8px 0;color:#ffffff;">${data.phone || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#7aaecc;">Service</td><td style="padding:8px 0;color:#6ab4e8;">${data.service}</td></tr>
        </table>
        <hr style="border-color:#1e3a5f;margin:24px 0;"/>
        <h3 style="color:#7aaecc;margin-bottom:12px;">Message</h3>
        <p style="color:#c8dff0;line-height:1.7;">${data.message}</p>
        <hr style="border-color:#1e3a5f;margin-top:32px;"/>
        <p style="color:#4a90c4;font-size:12px;margin:0;">Sent via 3ccore.com contact form</p>
      </div>
    `,
  })
}
