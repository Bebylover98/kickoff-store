import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    );
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const productId = session.metadata?.productId;
    const quantity = Number(session.metadata?.quantity ?? 1);
    const metadataCustomerId = session.metadata?.customerId;

    if (!productId) {
      return NextResponse.json({ error: 'Missing product metadata' }, { status: 400 });
    }

    const customer = metadataCustomerId
      ? await prisma.customer.findUnique({ where: { id: metadataCustomerId } })
      : null;

    const persistedCustomer = customer ?? await prisma.customer.upsert({
      where: { email: session.customer_details?.email ?? 'guest@kickoffstore.local' },
      update: {},
      create: {
        email: session.customer_details?.email ?? 'guest@kickoffstore.local',
        name: session.customer_details?.name ?? 'Guest',
      },
    });

    const order = await prisma.order.create({
      data: {
        customerId: persistedCustomer.id,
        total: Number(session.amount_total ?? 0),
        currency: (session.currency ?? 'usd').toUpperCase(),
        status: 'PAID',
        paymentStatus: 'PAID',
        stripeSessionId: session.id,
        stripePaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        items: {
          create: {
            productId,
            quantity,
            unitPrice: Number((await prisma.product.findUnique({ where: { id: productId } }))?.price ?? 0),
          },
        },
      },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        inStock: {
          decrement: quantity,
        },
      },
    });

    return NextResponse.json({ received: true, orderId: order.id });
  }

  return NextResponse.json({ received: true });
}
