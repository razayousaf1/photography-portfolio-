export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Photo {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  cloudinary_url: string;
  cloudinary_public_id: string;
  is_featured: boolean;
  is_public: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhotoWithCategory extends Photo {
  category: Pick<Category, "id" | "name" | "slug"> | null;
}

export type InquiryKind = "contact" | "booking";

export interface Inquiry {
  id: string;
  kind: InquiryKind;
  name: string;
  email: string;
  phone: string | null;
  event_type: string | null;
  event_date: string | null;
  message: string;
  created_at: string;
}

export interface CategorySummary extends Category {
  photoCount: number;
  coverImage: string | null;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiSuccess<T> {
  data: T;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;
