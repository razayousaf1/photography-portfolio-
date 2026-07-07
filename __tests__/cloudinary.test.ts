import { describe, expect, it, beforeEach } from "vitest";
import crypto from "crypto";

const ENV = {
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo-cloud",
  CLOUDINARY_API_KEY: "123456",
  CLOUDINARY_API_SECRET: "test-secret",
  CLOUDINARY_UPLOAD_FOLDER: "shammaq-portfolio",
};

beforeEach(() => {
  Object.assign(process.env, ENV);
});

describe("getSignedUploadParams", () => {
  it("produces a signature matching Cloudinary's signing algorithm", async () => {
    const { getSignedUploadParams } = await import("@/lib/cloudinary");
    const params = getSignedUploadParams();

    const expected = crypto
      .createHash("sha1")
      .update(`folder=${params.folder}&timestamp=${params.timestamp}${ENV.CLOUDINARY_API_SECRET}`)
      .digest("hex");

    expect(params.signature).toBe(expected);
    expect(params.apiKey).toBe(ENV.CLOUDINARY_API_KEY);
    expect(params.cloudName).toBe(ENV.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    expect(params.folder).toBe(ENV.CLOUDINARY_UPLOAD_FOLDER);
  });

  it("never exposes the API secret itself", async () => {
    const { getSignedUploadParams } = await import("@/lib/cloudinary");
    const params = getSignedUploadParams();
    expect(JSON.stringify(params)).not.toContain(ENV.CLOUDINARY_API_SECRET);
  });
});

describe("optimizedImageUrl", () => {
  it("inserts transformation parameters for a Cloudinary URL", async () => {
    const { optimizedImageUrl } = await import("@/lib/cloudinary");
    const url = "https://res.cloudinary.com/demo-cloud/image/upload/v1700000000/sample.jpg";
    const result = optimizedImageUrl(url, { width: 800 });

    expect(result).toContain("/upload/f_auto,q_auto,w_800,c_limit/");
    expect(result).toContain("sample.jpg");
  });

  it("leaves non-Cloudinary URLs untouched", async () => {
    const { optimizedImageUrl } = await import("@/lib/cloudinary");
    const url = "https://images.unsplash.com/photo-123";
    expect(optimizedImageUrl(url, { width: 800 })).toBe(url);
  });
});
