export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          sort_order: number;
          cover_photo_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          sort_order?: number;
          cover_photo_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          sort_order?: number;
          cover_photo_id?: string | null;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          description: string | null;
          cloudinary_url: string;
          cloudinary_public_id: string;
          is_featured: boolean;
          is_public: boolean;
          uploaded_by: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          title: string;
          description?: string | null;
          cloudinary_url: string;
          cloudinary_public_id: string;
          is_featured?: boolean;
          is_public?: boolean;
          uploaded_by?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          cloudinary_url?: string;
          cloudinary_public_id?: string;
          is_featured?: boolean;
          is_public?: boolean;
          uploaded_by?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      inquiries: {
        Row: {
          id: string;
          kind: "contact" | "booking";
          name: string;
          email: string;
          phone: string | null;
          event_type: string | null;
          event_date: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: "contact" | "booking";
          name: string;
          email: string;
          phone?: string | null;
          event_type?: string | null;
          event_date?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          kind?: "contact" | "booking";
          name?: string;
          email?: string;
          phone?: string | null;
          event_type?: string | null;
          event_date?: string | null;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: boolean;
          hero_image_url: string | null;
          hero_image_public_id: string | null;
          hero_opacity: number;
          hero_mode: string;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          hero_image_url?: string | null;
          hero_image_public_id?: string | null;
          hero_opacity?: number;
          hero_mode?: string;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          hero_image_url?: string | null;
          hero_image_public_id?: string | null;
          hero_opacity?: number;
          hero_mode?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hero_images: {
        Row: {
          id: string;
          url: string;
          public_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          public_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          public_id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}