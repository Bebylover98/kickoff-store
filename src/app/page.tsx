import { prisma } from '@/lib/prisma';
import StoreHome from '@/components/StoreHome';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sport: p.sport,
    brand: p.brand,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    imageUrl: p.imageUrl,
    featured: p.featured,
    inStock: p.inStock,
  }));

  return <StoreHome products={serialized} />;
}