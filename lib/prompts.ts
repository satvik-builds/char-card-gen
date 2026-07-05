import {
  CHARACTER_CLASSES,
  FACTIONS,
  FACTION_DESCRIPTIONS,
  THEME_KEYS,
} from "./constants";
import type { Character } from "./types";

const FACTION_LIST = FACTIONS.map(
  (f) => `${f} (${FACTION_DESCRIPTIONS[f]})`,
).join("; ");

const ALLOWED_VALUES = `
Allowed "charClass" (pick EXACTLY one, verbatim): ${CHARACTER_CLASSES.join(", ")}.
Allowed "faction" (pick EXACTLY one of these keys, verbatim — a character of any
class may belong to any faction, so pick the most fitting): ${FACTION_LIST}.
Allowed "themeKey" (pick EXACTLY one, verbatim): ${THEME_KEYS.join(", ")}.
`.trim();

const TAG_GUIDE = `
The image model is Animagine XL 4.0 (a tag-based anime SDXL model). For
"appearanceTags" produce a single comma-separated string of danbooru-style tags,
NOT prose, in this order:
1. subject count + gender tag: exactly one of "1girl" or "1boy".
   This MUST match the character's "gender" (male -> 1boy, female -> 1girl).
2. "solo", "full body", "standing"
3. physical features that MATCH the gender (for male characters use masculine
   build/features such as "masculine, toned"; for female, feminine features):
   hair length/color/style, eye color, skin, build, age look
4. class fantasy: armor/robes/garb, signature weapon, accessories that match the
   character's class and faction (be specific and evocative)
5. composition: "simple background", "white background", "looking at viewer"
6. ALWAYS end with: masterpiece, high score, great score, absurdres
Do NOT include any text, letters, logos, or watermarks in the tags.
`.trim();

const SYSTEM_PROMPT = `
You are a master RPG loremaster and character designer. You invent vivid,
original fantasy characters for an ornate character card. You always respond
with a single JSON object matching the provided schema. No prose outside JSON.

Rules:
- "name": an evocative fantasy given name (1-2 words).
- "title": a short epithet such as "Oathkeeper", "Ashen Blade", "Stormcaller".
- "age": an integer appropriate to the race.
- "gender", "race": creative but coherent (race can be fantasy, e.g. Human, Elf,
  Half-Orc, Dragonborn, Fae).
- "alignment": a flavorful two-word moral alignment (e.g. "Chaotic Justice",
  "Lawful Ruin", "Neutral Ambition").
- "charClass": choose the single best fit from the allowed enum.
- "faction": choose the single best fit from the allowed enum.
- "languages": 2 to 5 languages (real or fantasy, e.g. Common, Elvish, Draconic).
- "stats": integers 0-100 for strength, constitution, agility, endurance,
  intelligence, charisma, luck, and "unique". Make them VARIED and reflective of
  the class (a Mage favors intelligence, a Barbarian favors strength, etc.).
  Avoid making them all similar. "unique" is the character's SIGNATURE class stat
  (e.g. a Mage's Arcana, a Barbarian's Rage, a Monk's Chi) — usually one of their
  higher scores.
- "bio": an array of 3 short narrative paragraphs (2-4 sentences each) telling
  the character's origin, hardship, and how they became who they are.
- "themeKey": pick the palette key from the enum that best fits the character's
  faction/class/mood (gold=noble/order, crimson=blood/war, azure=sea/arcane,
  verdant=nature, violet=magic/mystery, frost=ice/north, ember=fire/forge,
  ashen=death/undead/grim).

${ALLOWED_VALUES}

Respond with a JSON object using EXACTLY these keys and nothing else:
{
  "name": string,
  "title": string,
  "age": integer,
  "gender": string,
  "race": string,
  "alignment": string,
  "charClass": string,
  "faction": string,
  "languages": string[],
  "stats": { "strength": int, "constitution": int, "agility": int, "endurance": int, "intelligence": int, "charisma": int, "luck": int, "unique": int },
  "bio": string[],
  "themeKey": string,
  "appearanceTags": string
}
All integers must be plain numbers like 73 (never expressions, never strings).
Use the key "bio" (an array of paragraph strings) — do not rename it.

${TAG_GUIDE}
`.trim();

export function buildGenerationMessages(prefs?: string) {
  const userPrompt = prefs?.trim()
    ? `Create a brand new character. Honor these player preferences as much as possible: "${prefs.trim()}". If a preference conflicts with an enum, pick the closest allowed value.`
    : `Create a brand new, surprising random character. Vary race, class, gender, faction, and theme from typical defaults.`;

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userPrompt },
  ];
}

export function buildEditMessages(current: Character, instruction: string) {
  const system = `
You are editing an existing RPG character. You receive the current character as
JSON and an edit instruction. Respond with a JSON object:
- "patch": ONLY the fields that should change (same field names/types/enums as
  the character schema). Omit unchanged fields.
- "regenerateImage": true if the requested change affects the character's VISUAL
  appearance (hair, outfit, weapon, race, gender, body, pose, class look). If you
  set this true, you MUST include an updated "appearanceTags" in the patch
  following the tag rules below. Set false for purely textual changes (name,
  title, bio wording, stats, languages, alignment).
- "note": a one-sentence summary of what you changed.

${TAG_GUIDE}
`.trim();

  const user = `Current character JSON:\n${JSON.stringify(
    {
      name: current.name,
      title: current.title,
      age: current.age,
      gender: current.gender,
      race: current.race,
      alignment: current.alignment,
      charClass: current.charClass,
      faction: current.faction,
      languages: current.languages,
      stats: current.stats,
      bio: current.bio,
      themeKey: current.themeKey,
      appearanceTags: current.appearanceTags,
    },
    null,
    2,
  )}\n\nEdit instruction: "${instruction.trim()}"`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}
