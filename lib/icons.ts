import type { IconType } from "react-icons";
import {
  GiBroadsword,
  GiTemplarShield,
  GiBattleAxe,
  GiWizardStaff,
  GiFireSpellCast,
  GiPentacle,
  GiDeathSkull,
  GiBowman,
  GiHoodedFigure,
  GiDaggers,
  GiHolySymbol,
  GiOakLeaf,
  GiLyre,
  GiMonkFace,
  GiCrown,
  GiSpellBook,
  GiRaiseZombie,
  GiHolyGrail,
  GiHidden,
  GiFist,
  GiCompass,
  GiWolfHead,
  GiAnvil,
  GiSharkFin,
  GiTwoCoins,
  GiDragonHead,
} from "react-icons/gi";
import type { CharacterClass, Faction } from "./constants";

/*
  Icons sourced from game-icons.net (CC BY 3.0) via react-icons/gi.
  Attribution is documented in the README and public/icons/ATTRIBUTION.md.
  The top-left corner shows the class icon; the bottom-right shows the faction.
*/

export const CLASS_ICON: Record<CharacterClass, string> = {
  Knight: "GiBroadsword",
  Paladin: "GiTemplarShield",
  Barbarian: "GiBattleAxe",
  Mage: "GiWizardStaff",
  Sorcerer: "GiFireSpellCast",
  Warlock: "GiPentacle",
  Necromancer: "GiDeathSkull",
  Ranger: "GiBowman",
  Rogue: "GiHoodedFigure",
  Assassin: "GiDaggers",
  Cleric: "GiHolySymbol",
  Druid: "GiOakLeaf",
  Bard: "GiLyre",
  Monk: "GiMonkFace",
};

export const FACTION_ICON: Record<Faction, string> = {
  IronCrown: "GiCrown",
  ArcaneConclave: "GiSpellBook",
  VerdantCircle: "GiOakLeaf",
  SacredFlame: "GiHolyGrail",
  ShadowWeb: "GiHidden",
  VoidPact: "GiDeathSkull",
  WanderingCanticle: "GiLyre",
  StoneMonastery: "GiFist",
  FrostbornClans: "GiWolfHead",
  EmberForge: "GiAnvil",
  TideReavers: "GiSharkFin",
  UndyingLegion: "GiRaiseZombie",
  GildedCoin: "GiTwoCoins",
  Wyrmguard: "GiDragonHead",
  Unbound: "GiCompass",
};

/** Registry mapping a stored icon id to its renderable component. */
export const ICON_REGISTRY: Record<string, IconType> = {
  // Class icons
  GiBroadsword,
  GiTemplarShield,
  GiBattleAxe,
  GiWizardStaff,
  GiFireSpellCast,
  GiPentacle,
  GiDeathSkull,
  GiBowman,
  GiHoodedFigure,
  GiDaggers,
  GiHolySymbol,
  GiOakLeaf,
  GiLyre,
  GiMonkFace,
  // Faction icons
  GiCrown,
  GiSpellBook,
  GiHolyGrail,
  GiHidden,
  GiFist,
  GiCompass,
  GiWolfHead,
  GiAnvil,
  GiSharkFin,
  GiRaiseZombie,
  GiTwoCoins,
  GiDragonHead,
};

export function classIconId(charClass: string): string {
  return CLASS_ICON[charClass as CharacterClass] ?? "GiBroadsword";
}

export function factionIconId(faction: string): string {
  return FACTION_ICON[faction as Faction] ?? "GiCrown";
}

export function getIconComponent(iconId: string): IconType {
  return ICON_REGISTRY[iconId] ?? GiBroadsword;
}
