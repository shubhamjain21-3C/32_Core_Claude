import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { generateOtp, canResend } from '@/lib/otp-store'

const schema = z.object({
  method: z.enum(['email', 'phone']),
  email:  z.string().email().optional(),
  phone:  z.string().optional(),
  name:   z.string().optional(),
})

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  return local.slice(0, 2) + '***@' + domain
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return phone.slice(0, 3) + '****' + digits.slice(-3)
}

function otpEmailHtml(name: string, code: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#2C1F14;color:#FFF8EE;padding:40px 36px;border-radius:14px;border:1.5px solid rgba(212,134,10,0.35);">
      <p style="color:#D4860A;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 10px;">3C Core Portal</p>
      <h2 style="color:#FFF8EE;margin:0 0 6px;font-size:20px;font-weight:700;">Your verification code</h2>
      <p style="color:#C4A882;font-size:13px;margin:0 0 28px;">Hi ${name || 'there'}, use the code below to verify your account.</p>
      <div style="background:#1C1008;border:1.5px solid rgba(212,134,10,0.45);border-radius:10px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="font-size:38px;font-weight:700;letter-spacing:0.32em;color:#F0A830;margin:0;padding-left:0.32em;">${code}</p>
      </div>
      <p style="color:#C4A882;font-size:12px;line-height:1.65;margin:0 0 24px;">
        This code expires in <strong style="color:#FFF8EE;">10 minutes</strong>.<br/>
        If you didn&apos;t request this, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid rgba(212,134,10,0.2);margin:0 0 20px;"/>
      <p style="color:rgba(196,168,130,0.5);font-size:11px;margin:0;">Connected &middot; Consistent &middot; Confident &mdash; 3ccore.com</p>
    </div>
  `
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { method, email, phone, name } = schema.parse(body)

    // ── Email OTP ─────────────────────────────────────────────────────────────
    if (method === 'email') {
      if (!email) {
        return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
      }
      const key = `email:${email.toLowerCase()}`
      if (!canResend(key)) {
        return NextResponse.json({ error: 'Please wait 60 seconds before requesting another code.' }, { status: 429 })
      }
      const code = generateOtp(key)

      // Dev bypass — if RESEND_API_KEY is absent/placeholder, just log
      const isDevMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder'
      if (isDevMode) {
        console.log(`[OTP DEV] Email code for ${email}: ${code}`)
      } else {
        const from = process.env.RESEND_FROM_EMAIL
          ? `3C Core <${process.env.RESEND_FROM_EMAIL}>`
          : '3C Core <onboarding@resend.dev>'

        const { error } = await resend.emails.send({
          from,
          to: email,
          subject: `${code} — your 3C Core verification code`,
          html: otpEmailHtml(name ?? '', code),
        })
        if (error) {
          console.error('[OTP] Resend error:', error)
          return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 502 })
        }
      }

      return NextResponse.json({ success: true, masked: maskEmail(email) })
    }

    // ── Phone / SMS OTP ───────────────────────────────────────────────────────
    if (method === 'phone') {
      if (!phone) {
        return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
      }

      // Twilio not configured yet — inform user
      const twilioReady = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
      if (!twilioReady) {
        return NextResponse.json(
          { error: 'SMS verification is not yet available. Please use email verification.' },
          { status: 503 }
        )
      }

      const key = `phone:${phone}`
      if (!canResend(key)) {
        return NextResponse.json({ error: 'Please wait 60 seconds before requesting another code.' }, { status: 429 })
      }
      const code = generateOtp(key)

      // Twilio send (placeholder — wire up when credentials are added)
      console.log(`[OTP] SMS to ${phone}: ${code}`)

      return NextResponse.json({ success: true, masked: maskPhone(phone) })
    }

    return NextResponse.json({ error: 'Invalid method.' }, { status: 400 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }
    console.error('[OTP] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
