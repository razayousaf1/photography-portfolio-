import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category, CategorySummary, Photo, PhotoWithCategory } from "@/lib/types";

/**
 * DUMMY / DEMO DATA
 * ---------------------------------------------------------------------------
 * Until real Supabase + Cloudinary credentials are configured (see
 * .env.example), every data-fetching function below falls back to this
 * in-memory seed so the site is fully browsable out of the box. Once real
 * env vars are set and the schema in supabase/schema.sql has been run with
 * real uploaded photos, these functions will transparently start returning
 * live data instead — no code changes required.
 */

export const DUMMY_CATEGORIES: Category[] = [
  { id: "cat-fashion", name: "Fashion", slug: "fashion", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-product", name: "Product", slug: "product", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-corporate", name: "Corporate", slug: "corporate", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-weddings", name: "Weddings", slug: "weddings", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-commercial", name: "Commercial", slug: "commercial", created_at: "2026-01-01T00:00:00Z" },
];

const IMG = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

interface DummyPhotoSeed {
  id: string;
  categorySlug: string;
  title: string;
  description: string;
  image: string;
  featured?: boolean;
}

const DUMMY_PHOTO_SEED: DummyPhotoSeed[] = [
  { id: "p1", categorySlug: "fashion", title: "Champagne Light", description: "Studio editorial, backlit silhouette.", image: IMG("photo-1524504388940-b1c1722653e1"), featured: true },
  { id: "p2", categorySlug: "fashion", title: "Monochrome Muse", description: "Black and white portrait series.", image: IMG("photo-1516726817505-f5ed825624d8") },
  { id: "p3", categorySlug: "fashion", title: "Structured Line", description: "Tailoring on location, golden hour.", image: IMG("photo-1487222477894-8943e31ef7b2") },
  { id: "p4", categorySlug: "fashion", title: "Editorial Motion", description: "Fabric in motion, strobe freeze.", image: IMG("photo-1490481651871-ab68de25d43d") },

  { id: "p5", categorySlug: "product", title: "Glass & Shadow", description: "Fragrance bottle, dark reflective base.", image: IMG("photo-1541643600914-78b084683601"), featured: true },
  { id: "p6", categorySlug: "product", title: "Precision Watch", description: "Macro detail on a leather strap.", image: IMG("photo-1524805444758-089113d48a6d") },
  { id: "p7", categorySlug: "product", title: "Studio Still Life", description: "Minimal product arrangement.", image: IMG("photo-1523275335684-37898b6baf30") },
  { id: "p8", categorySlug: "product", title: "Texture Study", description: "Close crop, tactile lighting.", image: IMG("photo-1503602642458-232111445657") },

  { id: "p9", categorySlug: "corporate", title: "Boardroom Portrait", description: "Executive headshot, natural window light.", image: IMG("photo-1560250097-0b93528c311a"), featured: true },
  { id: "p10", categorySlug: "corporate", title: "Team at Work", description: "Candid documentary style, open office.", image: IMG("photo-1497366216548-37526070297c") },
  { id: "p11", categorySlug: "corporate", title: "Leadership Profile", description: "Environmental portrait, low key.", image: IMG("photo-1519085360753-af0119f7cbe7") },

  { id: "p12", categorySlug: "weddings", title: "First Look", description: "Documentary moment, soft morning light.", image: IMG("photo-1519741497674-611481863552"), featured: true },
  { id: "p13", categorySlug: "weddings", title: "The Vows", description: "Ceremony detail, wide establishing shot.", image: IMG("photo-1465495976277-4387d4b0b4c6") },
  { id: "p14", categorySlug: "weddings", title: "Golden Reception", description: "Dance floor, tungsten warmth.", image: IMG("photo-1511285560929-80b456fea0bc") },
  { id: "p15", categorySlug: "weddings", title: "Details & Rings", description: "Macro still life, ring exchange.", image: IMG("photo-1519225421980-715cb0215aed") },

  { id: "p16", categorySlug: "commercial", title: "Brand Campaign", description: "Location lifestyle shoot.", image: IMG("photo-1441986300917-64674bd600d8"), featured: true },
  { id: "p17", categorySlug: "commercial", title: "Interior Architecture", description: "Hospitality space, ambient light.", image: IMG("photo-1493809842364-78817add7ffb") },
  { id: "p18", categorySlug: "commercial", title: "Automotive Study", description: "Studio car photography, rim light.", image: IMG("photo-1503376780353-7e6692767b70") },
];

function buildDummyPhotos(): PhotoWithCategory[] {
  return DUMMY_PHOTO_SEED.map((seed, index) => {
    const category = DUMMY_CATEGORIES.find((c) => c.slug === seed.categorySlug) ?? null;
    const now = new Date(Date.now() - index * 86_400_000).toISOString();
    return {
      id: seed.id,
      category_id: category?.id ?? "",
      title: seed.title,
      description: seed.description,
      cloudinary_url: seed.image,
      cloudinary_public_id: `demo/${seed.id}`,
      is_featured: Boolean(seed.featured),
      is_public: true,
      uploaded_by: null,
      created_at: now,
      updated_at: now,
      category: category
        ? { id: category.id, name: category.name, slug: category.slug }
        : null,
    };
  });
}

export const DUMMY_PHOTOS: PhotoWithCategory[] = buildDummyPhotos();

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("dummyproject"));
}

/** Fetches all categories, falling back to demo data if unavailable. */
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return DUMMY_CATEGORIES;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return DUMMY_CATEGORIES;
    return data;
  } catch {
    return DUMMY_CATEGORIES;
  }
}

/** Category list enriched with photo count + a cover image for the home grid. */
export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const categories = await getCategories();
  const photos = await getPublicPhotos();

  return categories.map((category) => {
    const categoryPhotos = photos.filter((p) => p.category_id === category.id);
    const cover =
      categoryPhotos.find((p) => p.is_featured)?.cloudinary_url ??
      categoryPhotos[0]?.cloudinary_url ??
      null;

    return {
      ...category,
      photoCount: categoryPhotos.length,
      coverImage: cover,
    };
  });
}

/** Fetches every public photo with its parent category, newest first. */
export async function getPublicPhotos(): Promise<PhotoWithCategory[]> {
  if (!isSupabaseConfigured()) return DUMMY_PHOTOS;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("photos")
      .select("*, category:categories(id, name, slug)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error || !data) return DUMMY_PHOTOS;
    return data as unknown as PhotoWithCategory[];
  } catch {
    return DUMMY_PHOTOS;
  }
}

/** Public photos belonging to one category, by slug. */
export async function getPhotosByCategorySlug(
  slug: string
): Promise<{ category: Category | null; photos: PhotoWithCategory[] }> {
  const [categories, photos] = await Promise.all([getCategories(), getPublicPhotos()]);
  const category = categories.find((c) => c.slug === slug) ?? null;
  if (!category) return { category: null, photos: [] };

  return {
    category,
    photos: photos.filter((p) => p.category_id === category.id),
  };
}

/** Featured photos across all categories, for home page highlights. */
export async function getFeaturedPhotos(limit = 6): Promise<PhotoWithCategory[]> {
  const photos = await getPublicPhotos();
  return photos.filter((p) => p.is_featured).slice(0, limit);
}

/** All photos (including private) for the admin dashboard — owner-only data. */
export async function getAllPhotosForAdmin(): Promise<PhotoWithCategory[]> {
  if (!isSupabaseConfigured()) return DUMMY_PHOTOS;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("photos")
      .select("*, category:categories(id, name, slug)")
      .order("created_at", { ascending: false });

    if (error || !data) return DUMMY_PHOTOS;
    return data as unknown as PhotoWithCategory[];
  } catch {
    return DUMMY_PHOTOS;
  }
}

export function searchPhotos(photos: PhotoWithCategory[], query: string): PhotoWithCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return photos;

  return photos.filter((photo) => {
    const haystack = [
      photo.title,
      photo.description ?? "",
      photo.category?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export type { Photo };
