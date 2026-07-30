import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();
    const normalizedCode = String(code ?? '').trim().toUpperCase();

    if (!normalizedCode) {
      return NextResponse.json({ error: 'Enter a coupon code.' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 400 });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
    }
    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json({ error: `Minimum order of NPR ${coupon.minOrderAmount} required.` }, { status: 400 });
    }

    const discountAmount = coupon.discountType === 'PERCENT'
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : Math.min(coupon.discountValue, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
