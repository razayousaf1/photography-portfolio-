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
      console.info("[delete] demo mode — pretending to delete photo:", id);
      return NextResponse.json({ data: { deleted: true } }, { status: 200 });
    }

    const supabase = createServiceRoleClient();

    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("cloudinary_public_id")
      .eq("id", id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }

    try {
      await deleteCloudinaryAsset(photo.cloudinary_public_id);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion failed:", cloudinaryError);
      // Continue — we still want to remove the database row even if the
      // asset was already gone from Cloudinary, so the admin table stays
      // in sync. The error is logged for follow-up.
    }

    const { error: deleteError } = await supabase.from("photos").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Could not delete the photo record." }, { status: 500 });
    }

    return NextResponse.json({ data: { deleted: true } }, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
