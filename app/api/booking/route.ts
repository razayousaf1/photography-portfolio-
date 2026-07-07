import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { bookingFormSchema } from "@/lib/validations";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = bookingFormSchema.safeParse(body);
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
    console.info("[booking] demo mode — inquiry not persisted:", result.data);
    return NextResponse.json({ data: { received: true } }, { status: 201 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("inquiries").insert({
      kind: "booking",
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      event_type: result.data.eventType,
      event_date: result.data.eventDate,
      message: result.data.message,
    });

    if (error) {
      return NextResponse.json({ error: "Could not save your inquiry." }, { status: 500 });
    }

    return NextResponse.json({ data: { received: true } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
