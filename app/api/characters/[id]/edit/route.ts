import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deserializeCharacter } from "@/lib/types";
import { editCharacterContent, OllamaError } from "@/lib/ollama";
import { patchToUpdateData, regenerateImages } from "@/lib/characterService";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const instruction =
    typeof body?.instruction === "string" ? body.instruction.trim() : "";
  const jobId = typeof body?.jobId === "string" ? body.jobId : undefined;

  if (!instruction) {
    return NextResponse.json(
      { error: "An edit instruction is required." },
      { status: 400 },
    );
  }

  const row = await prisma.character.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const current = deserializeCharacter(row);

  try {
    const edit = await editCharacterContent(current, instruction);

    // Apply textual/field changes.
    await prisma.character.update({
      where: { id },
      data: patchToUpdateData(edit.patch),
    });

    // Regenerate art if the change is visual.
    let character;
    if (edit.regenerateImage) {
      character = await regenerateImages(id, { newSeed: false, jobId });
    } else {
      const updated = await prisma.character.findUnique({ where: { id } });
      character = deserializeCharacter(updated!);
    }

    return NextResponse.json({
      character,
      regeneratedImage: edit.regenerateImage,
      note: edit.note ?? null,
    });
  } catch (err) {
    const status = err instanceof OllamaError ? 502 : 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
