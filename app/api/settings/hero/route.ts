import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const heroSettingsSchema = z.object({
  heroImageUrl: z.string().url().nullable().optional(),
  heroImagePublicId: z.string().nullable().optional(),
  heroOpacity: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(request: Request) {
  try {
    await requireOwner();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const result = heroSettingsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Please check the settings." }, { status: 422 });
    }

    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
    );

    if (!isConfigured) {
      return NextResponse.json({ data: result.data }, { status: 200 });
    }

    const supabase = createServiceRoleClient();

    const updatePayload: {
      hero_image_url?: string | null;
      hero_image_public_id?: string | null;
      hero_opacity?: number;
    } = {};
    if (result.data.heroImageUrl !== undefined) updatePayload.hero_image_url = result.data.heroImageUrl;
    if (result.data.heroImagePublicId !== undefined)
      updatePayload.hero_image_public_id = result.data.heroImagePublicId;
    if (result.data.heroOpacity !== undefined) updatePayload.hero_opacity = result.data.heroOpacity;

    const { data, error } = await supabase
      .from("site_settings")
      .update(updatePayload)
      .eq("id", true)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not save the settings." }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}