import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  coverPhotoId: z.string().uuid().nullable().optional(),
});

function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
  );
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireOwner();
    const { id } = params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Please check the details." }, { status: 422 });
    }

    if (!isConfigured()) {
      return NextResponse.json({ data: { id, ...result.data } }, { status: 200 });
    }

    const supabase = createServiceRoleClient();

    // If setting a cover photo, make sure that photo actually belongs to
    // this category — otherwise a category could show someone else's photo.
    if (result.data.coverPhotoId) {
      const { data: photo, error: photoError } = await supabase
        .from("photos")
        .select("category_id")
        .eq("id", result.data.coverPhotoId)
        .single();

      if (photoError || !photo || photo.category_id !== id) {
        return NextResponse.json(
          { error: "That photo doesn't belong to this category." },
          { status: 422 }
        );
      }
    }

    const updatePayload: { name?: string; cover_photo_id?: string | null } = {};
    if (result.data.name !== undefined) updatePayload.name = result.data.name;
    if (result.data.coverPhotoId !== undefined) updatePayload.cover_photo_id = result.data.coverPhotoId;

    const { data, error } = await supabase
      .from("categories")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not update the category." }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireOwner();
    const { id } = params;
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    if (!isConfigured()) {
      return NextResponse.json({ data: { deleted: true } }, { status: 200 });
    }

    const supabase = createServiceRoleClient();

    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select("id, cloudinary_public_id")
      .eq("category_id", id);

    if (photosError) {
      return NextResponse.json({ error: "Could not check the category's photos." }, { status: 500 });
    }

    const photoCount = photos?.length ?? 0;

    if (photoCount > 0 && !force) {
      return NextResponse.json(
        {
          error: `This category has ${photoCount} photo${photoCount === 1 ? "" : "s"} in it.`,
          photoCount,
        },
        { status: 409 }
      );
    }

    // Force delete: clean up every photo's Cloudinary asset first, then
    // let the database cascade-delete the photo rows when the category
    // itself is deleted.
    if (photoCount > 0 && force && photos) {
      for (const photo of photos) {
        try {
          await deleteCloudinaryAsset(photo.cloudinary_public_id);
        } catch (err) {
          console.error("Cloudinary cleanup failed for", photo.id, err);
        }
      }
    }

    const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Could not delete the category." }, { status: 500 });
    }

    return NextResponse.json({ data: { deleted: true, photosDeleted: photoCount } }, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}