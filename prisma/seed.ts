import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Sport } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as never);

const jerseys = [
  {
    name: 'Elite Matchday Home Jersey',
    slug: 'elite-matchday-home-jersey',
    sport: Sport.FOOTBALL,
    brand: 'Northstar FC',
    price: 12900,
    compareAtPrice: 15900,
    description: 'A premium football jersey crafted for matchday energy and modern comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    featured: true,
    inStock: 12,
  },
  {
    name: 'Champions Away Jersey',
    slug: 'champions-away-jersey',
    sport: Sport.FOOTBALL,
    brand: 'Northstar FC',
    price: 11900,
    compareAtPrice: 14900,
    description: 'Lightweight away kit with a refined silhouette and breathable fabric.',
    imageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80',
    featured: true,
    inStock: 8,
  },
  {
    name: 'Signature Stadium Jersey',
    slug: 'signature-stadium-jersey',
    sport: Sport.FOOTBALL,
    brand: 'Lynx United',
    price: 13900,
    compareAtPrice: 16900,
    description: 'Engineered for comfort with a premium stitched crest and sharp detailing.',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80',
    featured: false,
    inStock: 6,
  },
  {
    name: 'Pro Cricket Limited Edition',
    slug: 'pro-cricket-limited-edition',
    sport: Sport.CRICKET,
    brand: 'Apex Cricket',
    price: 10900,
    compareAtPrice: 13900,
    description: 'A premium cricket jersey that balances agility, fit, and club-inspired style.',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80',
    featured: true,
    inStock: 10,
  },
  {
    name: 'Harbor Test Jersey',
    slug: 'harbor-test-jersey',
    sport: Sport.CRICKET,
    brand: 'Harbor Sports',
    price: 9800,
    compareAtPrice: 12400,
    description: 'A classic cricket look with tailored panels for unrestricted movement.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    featured: false,
    inStock: 4,
  },
  {
    name: 'City Cup Jersey',
    slug: 'city-cup-jersey',
    sport: Sport.CRICKET,
    brand: 'Harbor Sports',
    price: 8900,
    compareAtPrice: 10900,
    description: 'Refined heritage styling for weekend games and fan culture.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80',
    featured: false,
    inStock: 7,
  },
  {
    name: 'Courtline Performance Jersey',
    slug: 'courtline-performance-jersey',
    sport: Sport.BASKETBALL,
    brand: 'Courtline',
    price: 12400,
    compareAtPrice: 15400,
    description: 'A basketball jersey designed for fast breaks, warmups, and elevated streetwear.',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
    featured: true,
    inStock: 11,
  },
  {
    name: 'Rally Signature Jersey',
    slug: 'rally-signature-jersey',
    sport: Sport.BASKETBALL,
    brand: 'Rally House',
    price: 10200,
    compareAtPrice: 12900,
    description: 'Premium mesh construction with bold contemporary graphics.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    featured: false,
    inStock: 5,
  },
  {
    name: 'Hoops Heritage Jersey',
    slug: 'hoops-heritage-jersey',
    sport: Sport.BASKETBALL,
    brand: 'Rally House',
    price: 11400,
    compareAtPrice: 14400,
    description: 'A premium heritage-inspired kit that feels at home in any arena.',
    imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80',
    featured: true,
    inStock: 9,
  },
  {
    name: 'Arena Pulse Jersey',
    slug: 'arena-pulse-jersey',
    sport: Sport.BASKETBALL,
    brand: 'Courtline',
    price: 9400,
    compareAtPrice: 11900,
    description: 'Built for comfort with a sleek cut and standout colorways.',
    imageUrl: 'https://images.unsplash.com/photo-1496284045401-7e0ea5b1d5b0?auto=format&fit=crop&w=900&q=80',
    featured: false,
    inStock: 6,
  },
];

async function main() {
  await prisma.product.deleteMany();

  for (const jersey of jerseys) {
    await prisma.product.create({ data: jersey });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
