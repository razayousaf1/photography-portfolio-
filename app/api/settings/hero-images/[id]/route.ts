import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireOwner();
    const { id } = params;

    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
    );

    if (!isConfigured) {
      return NextResponse.json({ data: { deleted: true } }, { status: 200 });
    }

    const supabase = createServiceRoleClient();

    const { data: image, error: fetchError } = await supabase
      .from("hero_images")
      .select("public_id")
      .eq("id", id)
      .single();

    if (fetchError || !image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    try {
      await deleteCloudinaryAsset(image.public_id);
    } catch (err) {
      console.error("Cloudinary cleanup failed:", err);
    }

    const { error: deleteError } = await supabase.from("hero_images").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Could not delete the image." }, { status: 500 });
    }

    return NextResponse.json({ data: { deleted: true } }, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}