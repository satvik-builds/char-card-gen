import { NextRequest, NextResponse } from "next/server";
import { generateCharacterContent, OllamaError } from "@/lib/ollama";
import { createCharacterFromContent } from "@/lib/characterService";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const prefs =
    typeof body?.prefs === "string" && body.prefs.trim()
      ? (body.prefs as string)
      : undefined;

  try {
    const content = await generateCharacterContent(prefs);
    const character = await createCharacterFromContent(content, prefs);
    return NextResponse.json({ character });
  } catch (err) {
    const status = err instanceof OllamaError ? 502 : 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
