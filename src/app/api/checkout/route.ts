import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const slug = String(formData.get('slug') ?? '');
  const quantity = Number(formData.get('quantity') ?? 1);

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const session = await auth();
  const customerId = session?.user?.id && session.user.id !== 'admin' ? session.user.id : undefined;

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }

  const lineItems = [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.name,
        description: product.description,
        images: [product.imageUrl],
      },
      unit_amount: product.price,
    },
    quantity,
  }];

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/orders/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/products/${product.slug}`,
    metadata: {
      productId: product.id,
      slug,
      quantity: String(quantity),
      customerId: customerId ?? '',
    },
  });

  return NextResponse.redirect(checkoutSession.url ?? '/', 303);
}
