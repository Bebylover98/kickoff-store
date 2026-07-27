import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'You must be logged in to place an order.' }, { status: 401 });
  }

  const body = await req.json();
  const {
    items, contactName, contactPhone, addressLine1, addressLine2,
    city, state, postalCode, country, notes,
  } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
  }
  if (!contactName || !contactPhone || !addressLine1 || !city || !state || !country) {
    return NextResponse.json({ error: 'Missing required delivery details.' }, { status: 400 });
  }

  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });

  const orderItemsData: { productId: string; quantity: number; unitPrice: number }[] = [];
  let total = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    const qty = Number(item.quantity);
    if (!product || !Number.isInteger(qty) || qty <= 0) {
      return NextResponse.json({ error: 'One or more items are invalid.' }, { status: 400 });
    }
    if (qty > product.inStock) {
      return NextResponse.json({ error: `Not enough stock for ${product.name}.` }, { status: 400 });
    }
    orderItemsData.push({ productId: product.id, quantity: qty, unitPrice: product.price });
    total += product.price * qty;
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerId: session.user.id as string,
        total,
        contactName,
        contactPhone,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        postalCode: postalCode || '',
        country,
        notes: notes || null,
        items: { create: orderItemsData },
      },
    });
    for (const item of orderItemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inStock: { decrement: item.quantity } },
      });
    }
    return created;
  });

  return NextResponse.json({ id: order.id }, { status: 201 });
}