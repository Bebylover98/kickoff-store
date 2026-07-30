import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

export const dynamic = 'force-dynamic';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createProduct(formData: FormData) {
  'use server';
  const name = String(formData.get('name') ?? '');
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  const brand = String(formData.get('brand') ?? '');
  const sport = String(formData.get('sport') ?? 'FOOTBALL');
  const description = String(formData.get('description') ?? '');
  const price = Number(formData.get('price') ?? 0);
  const compareAtPrice = Number(formData.get('compareAtPrice') ?? 0);
  const inStock = Number(formData.get('inStock') ?? 0);
  const featured = formData.get('featured') === 'on';

  if (!Number.isFinite(price) || price < 0 || price > 1000000) {
    throw new Error('Price must be between 0 and 1,000,000 NPR.');
  }
  if (compareAtPrice && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0 || compareAtPrice > 1000000)) {
    throw new Error('Compare-at price must be between 0 and 1,000,000 NPR.');
  }

  const imageFile = formData.get('image') as File | null;
  const uploadedImageUrl = imageFile && imageFile.size > 0
    ? await uploadImageToCloudinary(imageFile)
    : null;
  const imageUrl = uploadedImageUrl ?? 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80';

  await prisma.product.create({
    data: {
      name,
      slug,
      brand,
      sport: sport as 'FOOTBALL' | 'CRICKET' | 'BASKETBALL',
      description,
      price,
      compareAtPrice: compareAtPrice || null,
      inStock,
      featured,
      imageUrl,
      isActive: true,
    },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

async function deleteProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export default async function AdminProductsPage() {
  let products: Array<{ id: string; name: string; slug: string; brand: string; sport: string; description: string; price: number; compareAtPrice: number | null; inStock: number; featured: boolean; imageUrl: string; isActive: boolean }> = [];

try {
  products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
} catch {
  products = [];
}

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Admin Console</p>
            <h1 className="mt-2 text-3xl font-semibold">Products</h1>
          </div>
          <div className="flex gap-2">
            <a href="/admin/orders" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Orders</a>
            <a href="/admin/coupons" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Coupons</a>
            <a href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">View storefront</a>
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <h2 className="text-xl font-semibold">Add Product</h2>
          <form action={createProduct} className="mt-6 grid gap-4 md:grid-cols-2">
            <input name="name" required placeholder="Product name" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            
            <input name="brand" required placeholder="Brand" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <select name="sport" defaultValue="FOOTBALL" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3">
              <option value="FOOTBALL">Football</option>
              <option value="CRICKET">Cricket</option>
              <option value="BASKETBALL">Basketball</option>
            </select>
            <input name="price" type="number" required min="0" max="1000000" placeholder="Price in NPR (e.g. 2500)" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="compareAtPrice" type="number" min="0" max="1000000" placeholder="Compare-at price in NPR" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="inStock" type="number" required placeholder="Stock" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm">
              <input name="featured" type="checkbox" className="h-4 w-4" />
              Featured product
            </label>
            <input name="image" type="file" accept="image/*" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 md:col-span-2" />
            <textarea name="description" required placeholder="Description" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 md:col-span-2" rows={4} />
            <button className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 md:col-span-2">Create Product</button>
          </form>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Sport</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-white/10 bg-slate-950/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-slate-400">{product.brand}</div>
                    </td>
                    <td className="px-4 py-3">{product.sport}</td>
                    <td className="px-4 py-3">{formatNPR(product.price)}</td>
                    <td className="px-4 py-3">{product.inStock}</td>
                    <td className="px-4 py-3">{product.featured ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <a href={`/admin/products/${product.id}/edit`} className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/10 transition">
                          Edit
                        </a>
                        <form action={deleteProduct} className="inline">
                          <input type="hidden" name="id" value={product.id} />
                          <button className="rounded-lg border border-rose-400/40 px-3 py-2 text-xs text-rose-200">Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
