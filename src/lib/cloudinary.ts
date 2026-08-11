import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(file: File) {
  console.log('[cloudinary] upload attempt', {
    fileName: file?.name,
    fileSize: file?.size,
    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  });
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('[cloudinary] missing env vars, skipping upload');
    return null;
  }
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kickoffstore/products',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(error);
            return;
          }
          resolve(result as { secure_url: string });
        }
      );
      uploadStream.end(bytes);
    });
    console.log('[cloudinary] upload success', result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error('[cloudinary] upload failed', err);
    return null;
  }
}