import { prisma } from "@/lib/prisma";
import { deserializeCharacter } from "@/lib/types";
import { Studio } from "@/components/Studio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
  });
  const characters = rows.map(deserializeCharacter);
  return <Studio initialCharacters={characters} />;
}
