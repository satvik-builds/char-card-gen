import {
  characterContentSchema,
  type CharacterContent,
  type CharacterEdit,
  type Character,
  type Stats,
} from "./types";
import { buildEditMessages, buildGenerationMessages } from "./prompts";
import {
  CHARACTER_CLASSES,
  FACTIONS,
  STAT_KEYS,
  THEME_KEYS,
  type ThemeKey,
} from "./constants";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen3.5:9b";

export class OllamaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OllamaError";
  }
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaChatResponse {
  message?: { content?: string };
  error?: string;
}

/**
 * Calls Ollama in generic JSON mode (`format: "json"`), which guarantees
 * syntactically valid JSON. We do NOT use JSON-schema mode: it proved
 * unreliable for this nested schema (the model invented fields and emitted
 * non-JSON tokens). Semantic shape is enforced by our normalizers instead.
 */
async function chatJson(messages: ChatMessage[]): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        format: "json",
        stream: false,
        // Disable "thinking" so reasoning models spend their budget on the JSON.
        think: false,
        options: { temperature: 0.9, top_p: 0.95, num_predict: 2048 },
      }),
    });
  } catch (err) {
    throw new OllamaError(
      `Could not reach Ollama at ${OLLAMA_BASE_URL}. Is it running? (${
        (err as Error).message
      })`,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new OllamaError(
      `Ollama returned ${res.status}: ${text || res.statusText}`,
    );
  }

  const data = (await res.json()) as OllamaChatResponse;
  if (data.error) throw new OllamaError(`Ollama error: ${data.error}`);

  const content = data.message?.content;
  if (!content) throw new OllamaError("Ollama returned an empty response.");

  try {
    return JSON.parse(content);
  } catch {
    throw new OllamaError("Ollama did not return valid JSON.");
  }
}

/* ------------------------------ normalizers ------------------------------ */

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asString(v: unknown, fallback: string): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number") return String(v);
  return fallback;
}

function asInt(v: unknown, min: number, max: number, fallback: number): number {
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string"
        ? parseFloat(v.replace(/[^0-9.-]/g, ""))
        : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function asStringArray(
  v: unknown,
  fallback: string[],
  min: number,
  max: number,
): string[] {
  let arr = Array.isArray(v)
    ? v.filter((x) => typeof x === "string" && x.trim()).map((x) => String(x).trim())
    : [];
  if (arr.length === 0) arr = [...fallback];
  while (arr.length < min) arr.push(fallback[arr.length % fallback.length] ?? "—");
  if (arr.length > max) arr = arr.slice(0, max);
  return arr;
}

function coerceEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  if (typeof value !== "string") return fallback;
  const v = value.trim().toLowerCase();
  const exact = allowed.find((a) => a.toLowerCase() === v);
  if (exact) return exact;
  const partial = allowed.find(
    (a) => v.includes(a.toLowerCase()) || a.toLowerCase().includes(v),
  );
  return partial ?? fallback;
}

function genderTag(gender: string): string {
  const g = gender.toLowerCase();
  if (g.startsWith("f") || g.includes("woman") || g.includes("girl"))
    return "1girl";
  if (g.startsWith("m") || g.includes("man") || g.includes("boy"))
    return "1boy";
  return "1other";
}

function fallbackAppearance(
  gender: string,
  race: string,
  charClass: string,
): string {
  return `${genderTag(gender)}, solo, full body, standing, ${race.toLowerCase()} ${charClass.toLowerCase()}, intricate armor, signature weapon, fantasy, simple background, white background, looking at viewer, masterpiece, high score, great score, absurdres`;
}

const DEFAULT_BIO = [
  "Little is known of this figure's origins, lost to the turning of ages.",
  "What is certain is that hardship forged them into who they have become.",
  "Their tale is still being written — blade and will set against the dark.",
];

function randomStat(): number {
  return 35 + Math.floor(Math.random() * 50);
}

function normalizeStats(v: unknown): Stats {
  const src = asObject(v);
  const out = {} as Stats;
  for (const key of STAT_KEYS) {
    out[key] = asInt(src[key], 0, 100, randomStat());
  }
  out.unique = asInt(src.unique, 0, 100, randomStat());
  return out;
}

/** Only the stat keys the model actually provided (for partial edits). */
function normalizeStatsPartial(v: unknown): Partial<Stats> {
  const src = asObject(v);
  const out: Partial<Stats> = {};
  for (const key of [...STAT_KEYS, "unique"] as const) {
    if (key in src && src[key] !== null && src[key] !== undefined) {
      out[key] = asInt(src[key], 0, 100, randomStat());
    }
  }
  return out;
}

/** Build a guaranteed-valid CharacterContent from arbitrary model output. */
function normalizeContent(raw: unknown): CharacterContent {
  const o = asObject(raw);
  const gender = asString(o.gender, "Unknown");
  const race = asString(o.race, "Human");
  const charClass = coerceEnum(o.charClass, CHARACTER_CLASSES, "Knight");

  const content: CharacterContent = {
    name: asString(o.name, "Unnamed Wanderer").slice(0, 40),
    title: asString(o.title, "the Nameless").slice(0, 60),
    age: asInt(o.age, 1, 100000, 25),
    gender,
    race,
    alignment: asString(o.alignment, "True Neutral").slice(0, 40),
    charClass,
    faction: coerceEnum(o.faction, FACTIONS, "Unbound"),
    languages: asStringArray(o.languages, ["Common"], 1, 8),
    stats: normalizeStats(o.stats),
    bio: asStringArray(o.bio, DEFAULT_BIO, 2, 4),
    themeKey: coerceEnum(o.themeKey, THEME_KEYS, "gold"),
    appearanceTags: asString(
      o.appearanceTags,
      fallbackAppearance(gender, race, charClass),
    ),
  };

  // Final safety net: validate; normalizers above should always satisfy this.
  return characterContentSchema.parse(content);
}

/* ------------------------------ public API ------------------------------- */

export async function generateCharacterContent(
  prefs?: string,
): Promise<CharacterContent> {
  const raw = await chatJson(buildGenerationMessages(prefs));
  return normalizeContent(raw);
}

/** Normalize an edit patch, keeping only fields the model actually supplied. */
function normalizePatch(
  raw: unknown,
  current: Character,
): Partial<CharacterContent> {
  const o = asObject(raw);
  const patch: Partial<CharacterContent> = {};
  const has = (k: string) => k in o && o[k] !== null && o[k] !== undefined;

  if (has("name")) patch.name = asString(o.name, current.name).slice(0, 40);
  if (has("title")) patch.title = asString(o.title, current.title).slice(0, 60);
  if (has("age")) patch.age = asInt(o.age, 1, 100000, current.age);
  if (has("gender")) patch.gender = asString(o.gender, current.gender);
  if (has("race")) patch.race = asString(o.race, current.race);
  if (has("alignment"))
    patch.alignment = asString(o.alignment, current.alignment).slice(0, 40);
  if (has("charClass"))
    patch.charClass = coerceEnum(o.charClass, CHARACTER_CLASSES, "Knight");
  if (has("faction"))
    patch.faction = coerceEnum(o.faction, FACTIONS, "Unbound");
  if (has("languages"))
    patch.languages = asStringArray(o.languages, current.languages, 1, 8);
  if (has("stats"))
    patch.stats = { ...current.stats, ...normalizeStatsPartial(o.stats) };
  if (has("bio")) patch.bio = asStringArray(o.bio, current.bio, 2, 4);
  if (has("themeKey"))
    patch.themeKey = coerceEnum(
      o.themeKey,
      THEME_KEYS,
      current.themeKey as ThemeKey,
    );
  if (has("appearanceTags"))
    patch.appearanceTags = asString(o.appearanceTags, current.appearanceTags);

  return patch;
}

export async function editCharacterContent(
  current: Character,
  instruction: string,
): Promise<CharacterEdit> {
  const raw = asObject(await chatJson(buildEditMessages(current, instruction)));
  const patch = normalizePatch(raw.patch, current);
  return {
    patch,
    regenerateImage: raw.regenerateImage === true,
    note: typeof raw.note === "string" ? raw.note : undefined,
  };
}
