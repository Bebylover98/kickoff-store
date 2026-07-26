import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const customer = await prisma.customer.findUnique({ where: { email: session.user.email } });
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  const address = await prisma.address.create({
    data: {
      customerId: customer.id,
      label: body.label ?? 'Home',
      fullName: body.fullName,
      line1: body.line1,
      line2: body.line2 ?? null,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      isDefault: Boolean(body.isDefault),
    },
  });

  return NextResponse.json(address);
}
