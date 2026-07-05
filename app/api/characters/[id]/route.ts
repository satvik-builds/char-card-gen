import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deserializeCharacter } from "@/lib/types";
import { deleteCharacterImages } from "@/lib/storage";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const row = await prisma.character.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ character: deserializeCharacter(row) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const existing = await prisma.character.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.character.delete({ where: { id } });
  await deleteCharacterImages(id).catch(() => {});
  return NextResponse.json({ ok: true });
}
