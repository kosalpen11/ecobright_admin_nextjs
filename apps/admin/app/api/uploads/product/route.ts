import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getOptimizationHint,
  optimizeGalleryImage,
  optimizeMainImage
} from "@/lib/image-optimizer";
import { uploadProductImageToR2 } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const kindValue = formData.get("kind");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (kindValue !== "main" && kindValue !== "gallery") {
      return NextResponse.json({ error: "Invalid upload kind." }, { status: 400 });
    }

    const optimized =
      kindValue === "main"
        ? await optimizeMainImage(file)
        : await optimizeGalleryImage(file);

    const result = await uploadProductImageToR2({
      kind: kindValue,
      body: optimized.buffer,
      contentType: optimized.contentType
    });

    return NextResponse.json({
      ...result,
      contentType: optimized.contentType,
      size: optimized.size,
      hint: getOptimizationHint(optimized.size)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
