import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { uploadPhotoSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await requireOwner();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const result = uploadPhotoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Please check the upload details.", details: result.error.message },
        { status: 422 }
      );
    }

    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
    );

    if (!isConfigured) {
      console.info("[upload] demo mode — photo not persisted:", result.data);
      return NextResponse.json({ data: { id: "demo", ...result.data } }, { status: 201 });
    }

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("photos")
      .insert({
        title: result.data.title,
        description: result.data.description || null,
        category_id: result.data.categoryId,
        is_featured: result.data.isFeatured,
        is_public: result.data.isPublic,
        cloudinary_url: result.data.cloudinaryUrl,
        cloudinary_public_id: result.data.cloudinaryPublicId,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not save the photo." }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
