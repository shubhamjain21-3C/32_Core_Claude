import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured. Add it to your environment variables.' },
        { status: 503 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { serviceType, amount, userId, bookingId } = await req.json() as {
      serviceType: string
      amount: number       // in pence
      userId?: string
      bookingId?: string
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },  // enables Apple Pay, Google Pay, Card
      metadata: {
        service_type: serviceType,
        user_id: userId ?? '',
        booking_id: bookingId ?? '',
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Payment intent error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
