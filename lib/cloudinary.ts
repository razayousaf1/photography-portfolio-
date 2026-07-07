import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
const API_KEY = process.env.CLOUDINARY_API_KEY as string;
const API_SECRET = process.env.CLOUDINARY_API_SECRET as string;
const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "shammaq-portfolio";

interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Builds the params + signature needed for a direct, signed upload from the
 * browser to Cloudinary, without ever exposing CLOUDINARY_API_SECRET to the
 * client. The client posts the file directly to Cloudinary using these.
 */
export function getSignedUploadParams(): SignedUploadParams {
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = { folder: UPLOAD_FOLDER, timestamp };
  const signature = signParams(paramsToSign);

  return {
    timestamp,
    signature,
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
    folder: UPLOAD_FOLDER,
  };
}

function signParams(params: Record<string, string | number>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(sorted + API_SECRET)
    .digest("hex");
}

/**
 * Deletes an asset from Cloudinary by its public_id using the Admin API.
 * Called from a server-only Route Handler after the owner deletes a photo.
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = signParams({ public_id: publicId, timestamp });

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    { method: "POST", body }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary delete failed: ${response.status} ${text}`);
  }
}

/**
 * Returns a Cloudinary transformation URL for responsive, optimized delivery.
 * Falls back gracefully if the URL isn't a Cloudinary URL (e.g. dummy seed
 * data pointing at Unsplash) by returning it unchanged.
 */
export function optimizedImageUrl(
  url: string,
  { width, quality = "auto", format = "auto" }: { width?: number; quality?: string; format?: string } = {}
): string {
  if (!url.includes("res.cloudinary.com")) return url;

  const transformations = [
    "f_" + format,
    "q_" + quality,
    width ? `w_${width}` : null,
    "c_limit",
  ]
    .filter(Boolean)
    .join(",");

  return url.replace("/upload/", `/upload/${transformations}/`);
}
