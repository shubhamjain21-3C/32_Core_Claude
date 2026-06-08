import { NextResponse } from 'next/server'
import { z } from 'zod'
import { emailExists } from '@/lib/email-exists'

export const dynamic = 'force-dynamic'

// Lightweight existence check used by the registration form to fail fast
// before sending an OTP for an email that already has an account.
const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)
    const exists = await emailExists(email)
    return NextResponse.json({ exists })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ exists: false, message: 'Invalid email.' }, { status: 400 })
    }
    return NextResponse.json({ exists: false, message: 'Server error.' }, { status: 500 })
  }
}
