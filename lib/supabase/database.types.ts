// Hand-written mirror of the Supabase schema (supabase/schema.sql).
// If you change the schema, run `supabase gen types typescript` to regenerate
// this file automatically instead of editing it by hand long-term.

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
