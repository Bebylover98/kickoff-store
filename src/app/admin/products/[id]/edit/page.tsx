import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

async function updateProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '');
  const slug = String(formData.get('slug') ?? '');
  const brand = String(formData.get('brand') ?? '');
  const sport = String(formData.get('sport') ?? 'FOOTBALL');
  const description = String(formData.get('description') ?? '');
  const price = Number(formData.get('price') ?? 0);
  const compareAtPrice = Number(formData.get('compareAtPrice') ?? 0);
  const inStock = Number(formData.get('inStock') ?? 0);
  const featured = formData.get('featured') === 'on';
  const imageFile = formData.get('image') as File | null;
  const imageUrl = imageFile && imageFile.size > 0
    ? await uploadImageToCloudinary(imageFile)
    : undefined;

  await prisma.product.update({
    where: { id },
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
      ...(imageUrl ? { imageUrl } : {}),
    },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Admin Console</p>
            <h1 className="mt-2 text-3xl font-semibold">Edit Product</h1>
          </div>
          <a href="/admin/products" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
            Back to products
          </a>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <form action={updateProduct} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={product.id} />

            <input
              name="name"
              required
              defaultValue={product.name}
              placeholder="Product name"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />
            <input
              name="slug"
              required
              defaultValue={product.slug}
              placeholder="slug"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />
            <input
              name="brand"
              required
              defaultValue={product.brand}
              placeholder="Brand"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />
            <select
              name="sport"
              defaultValue={product.sport}
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            >
              <option value="FOOTBALL">Football</option>
              <option value="CRICKET">Cricket</option>
              <option value="BASKETBALL">Basketball</option>
            </select>
            <input
              name="price"
              type="number"
              required
              defaultValue={product.price}
              placeholder="Price (cents)"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />
            <input
              name="compareAtPrice"
              type="number"
              defaultValue={product.compareAtPrice ?? ''}
              placeholder="Compare-at price"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />
            <input
              name="inStock"
              type="number"
              required
              defaultValue={product.inStock}
              placeholder="Stock"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={product.featured}
                className="h-4 w-4"
              />
              Featured product
            </label>

            <div className="md:col-span-2">
              <p className="mb-2 text-xs text-slate-400">Current image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="mb-3 h-32 w-32 rounded-xl object-cover"
              />
              <input
                name="image"
                type="file"
                accept="image/*"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
              />
              <p className="mt-1 text-xs text-slate-500">Leave empty to keep the current image.</p>
            </div>

            <textarea
              name="description"
              required
              defaultValue={product.description}
              placeholder="Description"
              rows={4}
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 md:col-span-2"
            />

            <button className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 md:col-span-2">
              Save Changes
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}