import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(file: File) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return null;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type || 'image/png'};base64,${bytes.toString('base64')}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: 'kickoffstore/products',
    resource_type: 'image',
  });

  return result.secure_url as string;
}
