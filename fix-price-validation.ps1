# Run this from D:\kickoffstore
# Adds min/max limits to price inputs and server-side validation

Write-Host "Fixing src\app\admin\products\page.tsx ..."
$path1 = "src\app\admin\products\page.tsx"
$content1 = Get-Content -Raw $path1

# 1. Add server-side validation right after price/compareAtPrice are parsed in createProduct
$old1 = "  const price = Number(formData.get('price') ?? 0);
  const compareAtPrice = Number(formData.get('compareAtPrice') ?? 0);
  const inStock = Number(formData.get('inStock') ?? 0);
  const featured = formData.get('featured') === 'on';
  const imageFile = formData.get('image') as File | null;
  const uploadedImageUrl = imageFile && imageFile.size > 0"

$new1 = "  const price = Number(formData.get('price') ?? 0);
  const compareAtPrice = Number(formData.get('compareAtPrice') ?? 0);
  const inStock = Number(formData.get('inStock') ?? 0);
  const featured = formData.get('featured') === 'on';

  if (!Number.isFinite(price) || price < 0 || price > 100000000) {
    throw new Error('Price must be between 0 and 100,000,000 (i.e. up to NPR 1,000,000.00), entered in cents.');
  }
  if (compareAtPrice && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0 || compareAtPrice > 100000000)) {
    throw new Error('Compare-at price must be between 0 and 100,000,000, entered in cents.');
  }

  const imageFile = formData.get('image') as File | null;
  const uploadedImageUrl = imageFile && imageFile.size > 0"

if ($content1.Contains($old1)) {
  $content1 = $content1.Replace($old1, $new1)
  Write-Host "  - Added server-side validation to createProduct"
} else {
  Write-Host "  ! Could not find exact match for createProduct validation block - skipped (file may already differ)"
}

# 2. Add min/max to the price input field in the create form
$oldPriceInput = '<input name="price" type="number" required placeholder="Price (cents)" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />'
$newPriceInput = '<input name="price" type="number" required min="0" max="100000000" placeholder="Price in cents (e.g. 250000 = NPR 2500)" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />'

if ($content1.Contains($oldPriceInput)) {
  $content1 = $content1.Replace($oldPriceInput, $newPriceInput)
  Write-Host "  - Added min/max to price input"
} else {
  Write-Host "  ! Could not find price input to update - skipped"
}

# 3. Add min/max to compareAtPrice input
$oldCompareInput = '<input name="compareAtPrice" type="number" placeholder="Compare-at price" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />'
$newCompareInput = '<input name="compareAtPrice" type="number" min="0" max="100000000" placeholder="Compare-at price (cents)" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />'

if ($content1.Contains($oldCompareInput)) {
  $content1 = $content1.Replace($oldCompareInput, $newCompareInput)
  Write-Host "  - Added min/max to compareAtPrice input"
} else {
  Write-Host "  ! Could not find compareAtPrice input to update - skipped"
}

Set-Content -Path $path1 -Value $content1 -Encoding utf8
Write-Host "Done with page.tsx`n"

Write-Host "Fixing src\app\admin\products\[id]\edit\page.tsx ..."
$path2 = "src\app\admin\products\[id]\edit\page.tsx"
$content2 = Get-Content -Raw $path2

# 4. Add server-side validation in updateProduct
$old2 = "  const price = Number(formData.get('price') ?? 0);
  const compareAtPrice = Number(formData.get('compareAtPrice') ?? 0);
  const inStock = Number(formData.get('inStock') ?? 0);
  const featured = formData.get('featured') === 'on';
  const imageFile = formData.get('image') as File | null;
  const imageUrl = imageFile && imageFile.size > 0"

$new2 = "  const price = Number(formData.get('price') ?? 0);
  const compareAtPrice = Number(formData.get('compareAtPrice') ?? 0);
  const inStock = Number(formData.get('inStock') ?? 0);
  const featured = formData.get('featured') === 'on';

  if (!Number.isFinite(price) || price < 0 || price > 100000000) {
    throw new Error('Price must be between 0 and 100,000,000 (i.e. up to NPR 1,000,000.00), entered in cents.');
  }
  if (compareAtPrice && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0 || compareAtPrice > 100000000)) {
    throw new Error('Compare-at price must be between 0 and 100,000,000, entered in cents.');
  }

  const imageFile = formData.get('image') as File | null;
  const imageUrl = imageFile && imageFile.size > 0"

if ($content2.Contains($old2)) {
  $content2 = $content2.Replace($old2, $new2)
  Write-Host "  - Added server-side validation to updateProduct"
} else {
  Write-Host "  ! Could not find exact match for updateProduct validation block - skipped (file may already differ)"
}

# 5. Add min/max to price input in edit form
$oldEditPrice = '            <input
              name="price"
              type="number"
              required
              defaultValue={product.price}
              placeholder="Price (cents)"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />'
$newEditPrice = '            <input
              name="price"
              type="number"
              required
              min="0"
              max="100000000"
              defaultValue={product.price}
              placeholder="Price in cents (e.g. 250000 = NPR 2500)"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />'

if ($content2.Contains($oldEditPrice)) {
  $content2 = $content2.Replace($oldEditPrice, $newEditPrice)
  Write-Host "  - Added min/max to price input in edit form"
} else {
  Write-Host "  ! Could not find edit-form price input to update - skipped"
}

# 6. Add min/max to compareAtPrice input in edit form
$oldEditCompare = '            <input
              name="compareAtPrice"
              type="number"
              defaultValue={product.compareAtPrice ?? ''}
              placeholder="Compare-at price"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />'
$newEditCompare = '            <input
              name="compareAtPrice"
              type="number"
              min="0"
              max="100000000"
              defaultValue={product.compareAtPrice ?? ''}
              placeholder="Compare-at price (cents)"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3"
            />'

if ($content2.Contains($oldEditCompare)) {
  $content2 = $content2.Replace($oldEditCompare, $newEditCompare)
  Write-Host "  - Added min/max to compareAtPrice input in edit form"
} else {
  Write-Host "  ! Could not find edit-form compareAtPrice input to update - skipped"
}

Set-Content -Path $path2 -Value $content2 -Encoding utf8
Write-Host "Done with [id]\edit\page.tsx`n"

Write-Host "All done. Now run: npm run build"
