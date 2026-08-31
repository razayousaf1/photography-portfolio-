import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const addImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireOwner();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const result = addImageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid image data." }, { status: 422 });
    }

    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
    );

    if (!isConfigured) {
      return NextResponse.json({ data: { id: "demo", ...result.data } }, { status: 201 });
    }

    const supabase = createServiceRoleClient();

    const { count } = await supabase.from("hero_images").select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("hero_images")
      .insert({ url: result.data.url, public_id: result.data.publicId, sort_order: count ?? 0 })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not add the image." }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}