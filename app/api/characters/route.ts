import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deserializeCharacter } from "@/lib/types";

export async function GET() {
  const rows = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    characters: rows.map(deserializeCharacter),
  });
}
