import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Stripe requires raw body — disable Next.js body parsing for this route
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe webhook signature error:', msg)
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded:', pi.id, pi.metadata)
      // TODO: update payments table status = 'succeeded' when Supabase is configured
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', pi.id, pi.last_payment_error?.message)
      // TODO: update payments table status = 'failed'
      break
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      console.log('Charge refunded:', charge.id)
      // TODO: update payments table status = 'refunded'
      break
    }
    default:
      console.log('Unhandled Stripe event:', event.type)
  }

  return NextResponse.json({ received: true })
}
