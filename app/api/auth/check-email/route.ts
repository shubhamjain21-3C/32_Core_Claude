import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail } from '@/lib/store'

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
    const user = findUserByEmail(email)
    return NextResponse.json({ exists: !!user })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ exists: false, message: 'Invalid email.' }, { status: 400 })
    }
    return NextResponse.json({ exists: false, message: 'Server error.' }, { status: 500 })
  }
}
