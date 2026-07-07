import { NextResponse } from "next/server";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { getSignedUploadParams } from "@/lib/cloudinary";

export async function POST() {
  try {
    await requireOwner();
    const params = getSignedUploadParams();
    return NextResponse.json(params, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not sign the upload." }, { status: 500 });
  }
}
