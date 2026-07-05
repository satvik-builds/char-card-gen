import type { CSSProperties } from "react";
import type { ThemeKey } from "./constants";

/**
 * A card theme controls the parchment, metallic frame, ink, and accent colors.
 * The reference card is the "gold" theme; the others retheme the same template
 * for different factions / classes / character types.
 */
export interface CardTheme {
  key: ThemeKey;
  label: string;
  parchment: string; // main card surface
  parchmentEdge: string; // darker vignette toward edges
  frame: string; // metallic frame highlight
  frameDark: string; // frame shadow / engraving
  accent: string; // stat-bar fill, dividers, highlights
  accentTrack: string; // empty portion of stat bars
  ink: string; // primary text
  inkSoft: string; // muted labels
  bannerFill: string; // name banner background
  bannerBorder: string; // name banner edge
}

export const THEMES: Record<ThemeKey, CardTheme> = {
  gold: {
    key: "gold",
    label: "Gilded Oath",
    parchment: "#ece3cf",
    parchmentEdge: "#d8caab",
    frame: "#b89968",
    frameDark: "#7c5e34",
    accent: "#d9685c",
    accentTrack: "#2c2620",
    ink: "#3a2e22",
    inkSoft: "#7a6a52",
    bannerFill: "#efe7d4",
    bannerBorder: "#b89968",
  },
  crimson: {
    key: "crimson",
    label: "Bloodbound",
    parchment: "#efe1da",
    parchmentEdge: "#dcc4ba",
    frame: "#a8443a",
    frameDark: "#6e261f",
    accent: "#c0392b",
    accentTrack: "#2c211e",
    ink: "#3a211c",
    inkSoft: "#8a5a50",
    bannerFill: "#f3e6df",
    bannerBorder: "#a8443a",
  },
  azure: {
    key: "azure",
    label: "Tidecaller",
    parchment: "#dfe6ee",
    parchmentEdge: "#c2cedd",
    frame: "#4a6b8a",
    frameDark: "#2a4259",
    accent: "#3b7dd8",
    accentTrack: "#1f2730",
    ink: "#1f2c3a",
    inkSoft: "#566a80",
    bannerFill: "#e7edf4",
    bannerBorder: "#4a6b8a",
  },
  verdant: {
    key: "verdant",
    label: "Wildwarden",
    parchment: "#e2e8d8",
    parchmentEdge: "#c8d2b6",
    frame: "#5b7a4a",
    frameDark: "#36502a",
    accent: "#4a8c3f",
    accentTrack: "#222a1d",
    ink: "#25301f",
    inkSoft: "#5f7050",
    bannerFill: "#eaefe0",
    bannerBorder: "#5b7a4a",
  },
  violet: {
    key: "violet",
    label: "Arcanist",
    parchment: "#e7e0ee",
    parchmentEdge: "#cfc2dc",
    frame: "#6e4b8a",
    frameDark: "#452a59",
    accent: "#8e44ad",
    accentTrack: "#272030",
    ink: "#2c2138",
    inkSoft: "#6d5a82",
    bannerFill: "#efe8f4",
    bannerBorder: "#6e4b8a",
  },
  frost: {
    key: "frost",
    label: "Frostsworn",
    parchment: "#e3ecf0",
    parchmentEdge: "#c5d6de",
    frame: "#6f8a99",
    frameDark: "#425a67",
    accent: "#3aa6c0",
    accentTrack: "#1f2a2e",
    ink: "#243035",
    inkSoft: "#5a727c",
    bannerFill: "#eaf2f5",
    bannerBorder: "#6f8a99",
  },
  ember: {
    key: "ember",
    label: "Emberforged",
    parchment: "#efe2d4",
    parchmentEdge: "#dcc4a9",
    frame: "#b0703a",
    frameDark: "#7a451d",
    accent: "#e8722e",
    accentTrack: "#2c211a",
    ink: "#3a281c",
    inkSoft: "#8a6448",
    bannerFill: "#f4e8da",
    bannerBorder: "#b0703a",
  },
  ashen: {
    key: "ashen",
    label: "Ashen Pact",
    parchment: "#e4e2dd",
    parchmentEdge: "#cac6bd",
    frame: "#6b6660",
    frameDark: "#403c37",
    accent: "#8a857f",
    accentTrack: "#26241f",
    ink: "#2b2926",
    inkSoft: "#6a665f",
    bannerFill: "#ebe9e4",
    bannerBorder: "#6b6660",
  },
};

export function getTheme(key: string | undefined | null): CardTheme {
  return THEMES[(key as ThemeKey) ?? "gold"] ?? THEMES.gold;
}

/** Expose a theme as CSS custom properties for use on the card root element. */
export function themeToCssVars(theme: CardTheme): CSSProperties {
  return {
    "--card-parchment": theme.parchment,
    "--card-parchment-edge": theme.parchmentEdge,
    "--card-frame": theme.frame,
    "--card-frame-dark": theme.frameDark,
    "--card-accent": theme.accent,
    "--card-accent-track": theme.accentTrack,
    "--card-ink": theme.ink,
    "--card-ink-soft": theme.inkSoft,
    "--card-banner-fill": theme.bannerFill,
    "--card-banner-border": theme.bannerBorder,
  } as CSSProperties;
}
