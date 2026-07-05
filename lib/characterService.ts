import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  deserializeCharacter,
  type Character,
  type CharacterContent,
} from "./types";
import { classIconId, factionIconId } from "./icons";
import { generateHero } from "./imageClient";
import { saveImageDataUrl } from "./storage";

export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647);
}

/** Persist a freshly generated content payload as a new character row. */
export async function createCharacterFromContent(
  content: CharacterContent,
  prefs?: string,
): Promise<Character> {
  const row = await prisma.character.create({
    data: {
      name: content.name,
      title: content.title,
      age: content.age,
      gender: content.gender,
      race: content.race,
      alignment: content.alignment,
      charClass: content.charClass,
      faction: content.faction,
      languages: JSON.stringify(content.languages),
      stats: JSON.stringify(content.stats),
      bio: JSON.stringify(content.bio),
      themeKey: content.themeKey,
      classIconId: classIconId(content.charClass),
      factionIconId: factionIconId(content.faction),
      appearanceTags: content.appearanceTags,
      seed: randomSeed(),
      userPrefs: prefs?.trim() ? prefs.trim() : null,
    },
  });
  return deserializeCharacter(row);
}

interface RegenerateOptions {
  /** Use a new random seed (true) or keep the stored one (false). */
  newSeed?: boolean;
  /** Client-supplied job id so the UI can poll generation progress. */
  jobId?: string;
}

/** (Re)generate the hero art for a character and persist the file. */
export async function regenerateImages(
  characterId: string,
  opts: RegenerateOptions = {},
): Promise<Character> {
  const { newSeed = false, jobId } = opts;
  const row = await prisma.character.findUnique({
    where: { id: characterId },
  });
  if (!row) throw new Error("Character not found.");

  const seed = newSeed ? randomSeed() : row.seed;
  const res = await generateHero(row.appearanceTags, seed, row.gender, jobId);
  const heroImagePath = await saveImageDataUrl(
    characterId,
    "hero.png",
    res.image,
  );

  const updated = await prisma.character.update({
    where: { id: characterId },
    data: { seed, heroImagePath },
  });
  return deserializeCharacter(updated);
}

/** Build a Prisma update payload from a partial content patch (edit flow). */
export function patchToUpdateData(
  patch: Partial<CharacterContent>,
): Prisma.CharacterUpdateInput {
  const data: Prisma.CharacterUpdateInput = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.age !== undefined) data.age = patch.age;
  if (patch.gender !== undefined) data.gender = patch.gender;
  if (patch.race !== undefined) data.race = patch.race;
  if (patch.alignment !== undefined) data.alignment = patch.alignment;
  if (patch.charClass !== undefined) {
    data.charClass = patch.charClass;
    data.classIconId = classIconId(patch.charClass);
  }
  if (patch.faction !== undefined) {
    data.faction = patch.faction;
    data.factionIconId = factionIconId(patch.faction);
  }
  if (patch.languages !== undefined)
    data.languages = JSON.stringify(patch.languages);
  if (patch.stats !== undefined) data.stats = JSON.stringify(patch.stats);
  if (patch.bio !== undefined) data.bio = JSON.stringify(patch.bio);
  if (patch.themeKey !== undefined) data.themeKey = patch.themeKey;
  if (patch.appearanceTags !== undefined)
    data.appearanceTags = patch.appearanceTags;
  return data;
}
