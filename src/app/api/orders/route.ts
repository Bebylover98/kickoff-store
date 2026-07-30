import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'You must be logged in to place an order.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      items, contactName, contactPhone, addressLine1, addressLine2,
      city, state, postalCode, country, notes, couponCode,
    } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }
    if (!contactName || !contactPhone || !addressLine1 || !city || !state || !country) {
      return NextResponse.json({ error: 'Missing required delivery details.' }, { status: 400 });
    }
    const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const validFitTypes = ['MALE', 'FEMALE', 'COUPLE'];

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
    const orderItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
      size?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
      fitType?: 'MALE' | 'FEMALE' | 'COUPLE';
      partnerSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    }[] = [];
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

      const fitType = validFitTypes.includes(item.fitType) ? item.fitType : undefined;
      const size = validSizes.includes(item.size) ? item.size : undefined;
      const partnerSize = fitType === 'COUPLE' && validSizes.includes(item.partnerSize) ? item.partnerSize : undefined;

      const lineUnitPrice = fitType === 'COUPLE' ? product.price * 2 : product.price;

      orderItemsData.push({
        productId: product.id,
        quantity: qty,
        unitPrice: lineUnitPrice,
        size,
        fitType,
        partnerSize,
      });
      total += lineUnitPrice * qty;
    }

    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    let coupon = null;

    if (couponCode) {
      const normalizedCode = String(couponCode).trim().toUpperCase();
      coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });

      if (!coupon || !coupon.active) {
        return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 400 });
      }
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
      }
      if (total < coupon.minOrderAmount) {
        return NextResponse.json({ error: `Minimum order of NPR ${coupon.minOrderAmount} required for this coupon.` }, { status: 400 });
      }

      discountAmount = coupon.discountType === 'PERCENT'
        ? Math.round((total * coupon.discountValue) / 100)
        : Math.min(coupon.discountValue, total);

      appliedCouponCode = coupon.code;
      total = Math.max(total - discountAmount, 0);
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
          couponCode: appliedCouponCode,
          discountAmount,
          items: { create: orderItemsData },
        },
      });
      for (const item of orderItemsData) {
        const stockUsed = item.fitType === 'COUPLE' ? item.quantity * 2 : item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { inStock: { decrement: stockUsed } },
        });
      }
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
      return created;
    });

    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (err) {
    console.error('ORDER CREATE ERROR:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create order.' },
      { status: 500 },
    );
  }
}
