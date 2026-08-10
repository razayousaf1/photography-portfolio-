import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
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

    const result = reorderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid order list." }, { status: 422 });
    }

    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
    );

    if (!isConfigured) {
      return NextResponse.json({ data: { reordered: true } }, { status: 200 });
    }

    const supabase = createServiceRoleClient();

    await Promise.all(
      result.data.orderedIds.map((id, index) =>
        supabase.from("categories").update({ sort_order: index }).eq("id", id)
      )
    );

    return NextResponse.json({ data: { reordered: true } }, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}