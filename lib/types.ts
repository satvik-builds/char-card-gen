import { z } from "zod";
import type { Character as PrismaCharacter } from "@prisma/client";
import { CHARACTER_CLASSES, FACTIONS, THEME_KEYS } from "./constants";

const statValue = z.number().int().min(0).max(100);

export const statsSchema = z.object({
  strength: statValue,
  constitution: statValue,
  agility: statValue,
  endurance: statValue,
  intelligence: statValue,
  charisma: statValue,
  luck: statValue,
  // Signature class stat (name/meaning depends on the character's class).
  unique: statValue,
});
export type Stats = z.infer<typeof statsSchema>;

/**
 * Shape the LLM is asked to return. Derived/presentation fields (icon ids,
 * seed, image paths) are computed server-side, not by the model.
 */
export const characterContentSchema = z.object({
  name: z.string().min(1).max(40),
  title: z.string().min(1).max(60),
  age: z.number().int().min(1).max(100000),
  gender: z.string().min(1).max(40),
  race: z.string().min(1).max(40),
  alignment: z.string().min(1).max(40),
  charClass: z.enum(CHARACTER_CLASSES),
  faction: z.enum(FACTIONS),
  languages: z.array(z.string().min(1)).min(1).max(8),
  stats: statsSchema,
  bio: z.array(z.string().min(1)).min(2).max(4),
  themeKey: z.enum(THEME_KEYS),
  appearanceTags: z.string().min(1),
});
export type CharacterContent = z.infer<typeof characterContentSchema>;

/** A fully resolved character used by the UI (parsed JSON columns). */
export interface Character {
  id: string;
  name: string;
  title: string;
  age: number;
  gender: string;
  race: string;
  alignment: string;
  charClass: string;
  faction: string;
  languages: string[];
  stats: Stats;
  bio: string[];
  themeKey: string;
  classIconId: string;
  factionIconId: string;
  appearanceTags: string;
  seed: number;
  heroImagePath: string | null;
  userPrefs: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Convert a Prisma row (with JSON-encoded string columns) into a Character. */
export function deserializeCharacter(row: PrismaCharacter): Character {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    age: row.age,
    gender: row.gender,
    race: row.race,
    alignment: row.alignment,
    charClass: row.charClass,
    faction: row.faction,
    languages: safeParseArray(row.languages),
    stats: JSON.parse(row.stats) as Stats,
    bio: safeParseArray(row.bio),
    themeKey: row.themeKey,
    classIconId: row.classIconId,
    factionIconId: row.factionIconId,
    appearanceTags: row.appearanceTags,
    seed: row.seed,
    heroImagePath: row.heroImagePath,
    userPrefs: row.userPrefs,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function safeParseArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * Edit-flow response: a partial content patch plus a flag indicating whether
 * the visual appearance changed enough to warrant regenerating the hero image.
 */
export const characterEditSchema = z.object({
  patch: characterContentSchema.partial(),
  regenerateImage: z.boolean(),
  note: z.string().optional(),
});
export type CharacterEdit = z.infer<typeof characterEditSchema>;
