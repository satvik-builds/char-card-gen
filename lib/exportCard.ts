import { toPng } from "html-to-image";

/**
 * Capture a card DOM node to a high-resolution PNG and trigger a download.
 * Waits for web fonts to be ready so the blackletter/serif type renders.
 */
export async function downloadCardPng(
  node: HTMLElement,
  filename: string,
): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      // non-fatal: proceed without explicit font readiness
    }
  }

  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    skipFonts: false,
  });

  const link = document.createElement("a");
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.href = dataUrl;
  link.click();
}
