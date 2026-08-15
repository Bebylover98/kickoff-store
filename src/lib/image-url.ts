export function optimizedImageUrl(url: string, width: number) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
}
