import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validations";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = contactFormSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", details: result.error.message },
      { status: 422 }
    );
  }

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummyproject")
  );

  if (!isConfigured) {
    // Demo mode: accept the submission without a real database.
    console.info("[contact] demo mode — inquiry not persisted:", result.data);
    return NextResponse.json({ data: { received: true } }, { status: 201 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("inquiries").insert({
      kind: "contact",
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
    });

    if (error) {
      return NextResponse.json({ error: "Could not save your message." }, { status: 500 });
    }

    return NextResponse.json({ data: { received: true } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
