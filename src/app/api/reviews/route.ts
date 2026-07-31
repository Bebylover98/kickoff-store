import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'You must be logged in to leave a review.' }, { status: 401 });
  }
  try {
    const { productId, rating, comment } = await req.json();
    const ratingNum = Number(rating);

    if (!productId || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'A valid product and rating (1-5) are required.' }, { status: 400 });
    }

    const review = await prisma.review.upsert({
      where: {
        productId_customerId: {
          productId,
          customerId: session.user.id as string,
        },
      },
      update: {
        rating: ratingNum,
        comment: comment || null,
      },
      create: {
        productId,
        customerId: session.user.id as string,
        rating: ratingNum,
        comment: comment || null,
      },
    });

    return NextResponse.json({ id: review.id }, { status: 200 });
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
