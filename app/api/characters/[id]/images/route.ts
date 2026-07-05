import { NextRequest, NextResponse } from "next/server";
import { regenerateImages } from "@/lib/characterService";
import { ImageServiceError } from "@/lib/imageClient";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const newSeed = body?.newSeed === true;
  const jobId = typeof body?.jobId === "string" ? body.jobId : undefined;

  try {
    const character = await regenerateImages(id, { newSeed, jobId });
    return NextResponse.json({ character });
  } catch (err) {
    if ((err as Error).message === "Character not found.") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const status = err instanceof ImageServiceError ? 502 : 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
