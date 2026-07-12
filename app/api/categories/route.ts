import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { categoryFormSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    await requireOwner();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const result = categoryFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Please check the category name.", details: result.error.message },
        { status: 422 }
      );
    }

    const slug = slugify(result.data.name);
    if (!slug) {
      return NextResponse.json(
        { error: "That name doesn't produce a usable URL slug — try adding some letters." },
        { status: 422 }
      );
    }

    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
    );

    if (!isConfigured) {
      console.info("[categories] demo mode — category not persisted:", result.data);
      return NextResponse.json(
        { data: { id: "demo", name: result.data.name, slug } },
        { status: 201 }
      );
    }

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: result.data.name, slug })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `A category with a similar name already exists ("${slug}").` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Could not create the category." }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}