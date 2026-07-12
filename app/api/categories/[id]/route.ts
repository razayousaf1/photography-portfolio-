import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireOwner();
    const { id } = params;

    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
    );

    if (!isConfigured) {
      console.info("[categories] demo mode — pretending to delete category:", id);
      return NextResponse.json({ data: { deleted: true } }, { status: 200 });
    }

    const supabase = createServiceRoleClient();

    // Refuse to delete a category that still has photos in it — otherwise
    // the database would cascade-delete every photo along with it.
    const { count, error: countError } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      return NextResponse.json({ error: "Could not check the category's photos." }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `This category still has ${count} photo${count === 1 ? "" : "s"} in it. Move or delete ${
            count === 1 ? "it" : "them"
          } first.`,
        },
        { status: 409 }
      );
    }

    const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Could not delete the category." }, { status: 500 });
    }

    return NextResponse.json({ data: { deleted: true } }, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}