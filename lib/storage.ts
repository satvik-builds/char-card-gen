import { promises as fs } from "fs";
import path from "path";

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

/** Decode a `data:image/png;base64,...` URL and persist it under public/. */
export async function saveImageDataUrl(
  characterId: string,
  fileName: string,
  dataUrl: string,
): Promise<string> {
  const match = /^data:(image\/\w+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Invalid image data URL from image service.");
  }
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");

  const dir = path.join(GENERATED_DIR, characterId);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, buffer);

  // Public URL path (served by Next from /public).
  return `/generated/${characterId}/${fileName}`;
}

/** Remove all generated images for a character (used on delete). */
export async function deleteCharacterImages(characterId: string): Promise<void> {
  const dir = path.join(GENERATED_DIR, characterId);
  await fs.rm(dir, { recursive: true, force: true });
}
