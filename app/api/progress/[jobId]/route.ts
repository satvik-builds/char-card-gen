import { NextResponse } from "next/server";
import { getImageProgress } from "@/lib/imageClient";

interface Ctx {
  params: Promise<{ jobId: string }>;
}

/** Proxy the image service's live generation progress (0-100) for a job. */
export async function GET(_req: Request, { params }: Ctx) {
  const { jobId } = await params;
  try {
    const progress = await getImageProgress(jobId);
    return NextResponse.json({ progress });
  } catch {
    // If the image service is unreachable, report no progress rather than error.
    return NextResponse.json({ progress: 0 });
  }
}
