import { describe, expect, it, beforeEach } from "vitest";

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
});

describe("demo data fallback", () => {
  it("returns dummy categories when Supabase isn't configured", async () => {
    const { getCategories, DUMMY_CATEGORIES } = await import("@/lib/data");
    const categories = await getCategories();
    expect(categories).toEqual(DUMMY_CATEGORIES);
  });

  it("returns only public dummy photos", async () => {
    const { getPublicPhotos } = await import("@/lib/data");
    const photos = await getPublicPhotos();
    expect(photos.length).toBeGreaterThan(0);
    expect(photos.every((p) => p.is_public)).toBe(true);
  });

  it("scopes photos to the requested category slug", async () => {
    const { getPhotosByCategorySlug } = await import("@/lib/data");
    const { category, photos } = await getPhotosByCategorySlug("weddings");

    expect(category?.slug).toBe("weddings");
    expect(photos.length).toBeGreaterThan(0);
    expect(photos.every((p) => p.category?.slug === "weddings")).toBe(true);
  });

  it("returns an empty result for an unknown category slug", async () => {
    const { getPhotosByCategorySlug } = await import("@/lib/data");
    const { category, photos } = await getPhotosByCategorySlug("does-not-exist");

    expect(category).toBeNull();
    expect(photos).toEqual([]);
  });

  it("only returns photos flagged as featured", async () => {
    const { getFeaturedPhotos } = await import("@/lib/data");
    const featured = await getFeaturedPhotos();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.is_featured)).toBe(true);
  });
});

describe("searchPhotos", () => {
  it("matches on title, description, and category name, case-insensitively", async () => {
    const { DUMMY_PHOTOS, searchPhotos } = await import("@/lib/data");

    expect(searchPhotos(DUMMY_PHOTOS, "CHAMPAGNE").some((p) => p.title === "Champagne Light")).toBe(
      true
    );
    expect(searchPhotos(DUMMY_PHOTOS, "wedding").length).toBeGreaterThan(0);
  });

  it("returns everything for an empty query", async () => {
    const { DUMMY_PHOTOS, searchPhotos } = await import("@/lib/data");
    expect(searchPhotos(DUMMY_PHOTOS, "   ")).toEqual(DUMMY_PHOTOS);
  });

  it("returns nothing for a query that matches no photo", async () => {
    const { DUMMY_PHOTOS, searchPhotos } = await import("@/lib/data");
    expect(searchPhotos(DUMMY_PHOTOS, "xyzxyzxyz")).toEqual([]);
  });
});
