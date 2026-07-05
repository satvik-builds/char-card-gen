// Shared enums and constants used across the LLM schema, themes, and icons.

export const STAT_KEYS = [
  "strength",
  "constitution",
  "agility",
  "endurance",
  "intelligence",
  "charisma",
  "luck",
] as const;
export type StatKey = (typeof STAT_KEYS)[number];

// Human-readable French labels for the stat block (matches the reference card).
export const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  constitution: "Constitution",
  agility: "Agility",
  endurance: "Endurance",
  intelligence: "Intelligence",
  charisma: "Charisma",
  luck: "Luck",
};

export const CHARACTER_CLASSES = [
  "Knight",
  "Paladin",
  "Barbarian",
  "Mage",
  "Sorcerer",
  "Warlock",
  "Necromancer",
  "Ranger",
  "Rogue",
  "Assassin",
  "Cleric",
  "Druid",
  "Bard",
  "Monk",
] as const;
export type CharacterClass = (typeof CHARACTER_CLASSES)[number];

// Each class has a signature 8th stat with its own name + short description.
export const CLASS_UNIQUE_STAT: Record<
  CharacterClass,
  { name: string; description: string }
> = {
  Knight: {
    name: "Valor",
    description: "Unbreaking resolve that fuels heroic stands against the odds.",
  },
  Paladin: {
    name: "Devotion",
    description: "Strength of faith that empowers sacred oaths and smites evil.",
  },
  Barbarian: {
    name: "Rage",
    description: "Primal fury that swells the more desperate the battle becomes.",
  },
  Mage: {
    name: "Arcana",
    description: "Mastery of woven spellcraft and deep magical theory.",
  },
  Sorcerer: {
    name: "Surge",
    description: "Innate, volatile magic that erupts in unpredictable bursts.",
  },
  Warlock: {
    name: "Pact",
    description: "Borrowed power granted by an otherworldly patron.",
  },
  Necromancer: {
    name: "Mortis",
    description: "Command over death, decay, and the risen dead.",
  },
  Ranger: {
    name: "Tracking",
    description: "Skill at hunting, trailing prey, and reading the wild.",
  },
  Rogue: {
    name: "Cunning",
    description: "Guile with traps and locks, and turning any situation to profit.",
  },
  Assassin: {
    name: "Stealth",
    description: "The art of striking unseen and vanishing without a trace.",
  },
  Cleric: {
    name: "Faith",
    description: "Divine connection that channels healing and blessings.",
  },
  Druid: {
    name: "Wildshape",
    description: "Bond with nature granting beast-forms and verdant growth.",
  },
  Bard: {
    name: "Inspiration",
    description: "Power to embolden allies through song, story, and wit.",
  },
  Monk: {
    name: "Chi",
    description: "Inner life-energy focused into body, mind, and strike.",
  },
};

export function classUniqueStat(charClass: string): {
  name: string;
  description: string;
} {
  return (
    CLASS_UNIQUE_STAT[charClass as CharacterClass] ?? {
      name: "Resolve",
      description: "The character's defining inner strength.",
    }
  );
}

export const FACTIONS = [
  "IronCrown",
  "ArcaneConclave",
  "VerdantCircle",
  "SacredFlame",
  "ShadowWeb",
  "VoidPact",
  "WanderingCanticle",
  "StoneMonastery",
  "FrostbornClans",
  "EmberForge",
  "TideReavers",
  "UndyingLegion",
  "GildedCoin",
  "Wyrmguard",
  "Unbound",
] as const;
export type Faction = (typeof FACTIONS)[number];

// Short flavour used to help the LLM pick a fitting faction.
export const FACTION_DESCRIPTIONS: Record<Faction, string> = {
  IronCrown: "royal military, law enforcers, conquerors",
  ArcaneConclave: "scholar-mages, spellwright guild",
  VerdantCircle: "ancient nature covenant, beast-bonded druids",
  SacredFlame: "church of light, divine crusaders",
  ShadowWeb: "criminal syndicate, spies, assassins",
  VoidPact: "eldritch cultists bound to ancient horrors",
  WanderingCanticle: "free order of bards, storytellers, spies-in-plain-sight",
  StoneMonastery: "ascetic martial brotherhood, warrior-philosophers",
  FrostbornClans: "northern warrior tribes, ice-hardened raiders",
  EmberForge: "smith-warriors and fire-priests of the great forge",
  TideReavers: "sea raiders, corsairs, storm-callers",
  UndyingLegion: "necromantic army of the risen dead",
  GildedCoin: "merchant princes and mercenary financiers",
  Wyrmguard: "dragon-sworn knights and drake-riders",
  Unbound: "no allegiance, mercenaries, wanderers",
};

export const THEME_KEYS = [
  "gold",
  "crimson",
  "azure",
  "verdant",
  "violet",
  "frost",
  "ember",
  "ashen",
] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

// French section headings used on the card (faithful to the reference).
export const CARD_LABELS = {
  generalInfo: "Informations Générales",
  stats: "Précis / valeur",
  biography: "Biographie et Carrière",
  age: "Age",
  gender: "Gender",
  race: "Race",
  alignment: "Alignement",
  charClass: "Classe",
  faction: "Faction",
  languages: "Langues",
} as const;

// Human-readable display names for factions (enum keys are PascalCase).
export const FACTION_LABELS: Record<Faction, string> = {
  IronCrown: "The Iron Crown",
  ArcaneConclave: "The Arcane Conclave",
  VerdantCircle: "The Verdant Circle",
  SacredFlame: "The Sacred Flame",
  ShadowWeb: "The Shadow Web",
  VoidPact: "The Void Pact",
  WanderingCanticle: "The Wandering Canticle",
  StoneMonastery: "The Stone Monastery",
  FrostbornClans: "The Frostborn Clans",
  EmberForge: "The Ember Forge",
  TideReavers: "The Tide Reavers",
  UndyingLegion: "The Undying Legion",
  GildedCoin: "The Gilded Coin",
  Wyrmguard: "The Wyrmguard",
  Unbound: "Unbound",
};

export function factionLabel(faction: string): string {
  return (
    FACTION_LABELS[faction as Faction] ??
    faction.replace(/([a-z])([A-Z])/g, "$1 $2")
  );
}

export function factionDescription(faction: string): string {
  return FACTION_DESCRIPTIONS[faction as Faction] ?? "An independent power.";
}

// Richer lore shown in the faction info popover.
export interface FactionLore {
  doctrine: string;
  motto: string;
  recruits: string;
  leader: string;
  trivia: string;
}

export const FACTION_LORE: Record<Faction, FactionLore> = {
  IronCrown: {
    doctrine:
      "The realm's royal army and lawkeepers, holding that order forged in iron is the only shield against chaos.",
    motto: "Order is the only mercy.",
    recruits: "Disciplined soldiers and knights, of noble or common birth.",
    leader: "High Marshal Aldric Veyne",
    trivia: "Every recruit swears the Oath upon a blade that is never sheathed.",
  },
  ArcaneConclave: {
    doctrine:
      "A guild of scholar-mages devoted to cataloguing, mastering, and guarding the laws of magic.",
    motto: "Knowledge is the truest power.",
    recruits: "Gifted spellwrights, theorists, and the dangerously curious.",
    leader: "Archmagus Seleth of the Ninefold Spire",
    trivia: "Forbidden spells are not destroyed but sealed in the Deep Archive.",
  },
  VerdantCircle: {
    doctrine:
      "An ancient covenant of druids and beast-bonded who keep the balance between civilization and the wild.",
    motto: "From root to ruin, the cycle holds.",
    recruits: "Those who hear the green speech — wardens and beast-kin.",
    leader: "The Elder Stag (a title, never a name)",
    trivia: "Members plant a sapling for every life they are forced to take.",
  },
  SacredFlame: {
    doctrine:
      "A militant church that carries the Light into darkness, healing the faithful and burning the corrupt.",
    motto: "Let the Flame judge.",
    recruits: "Devout clerics, paladins, and sinners seeking redemption.",
    leader: "High Luminar Cassia Dawnward",
    trivia: "Their lanterns are said to never gutter, even underwater.",
  },
  ShadowWeb: {
    doctrine:
      "A sprawling syndicate of spies, smugglers, and assassins who trade in secrets and silence.",
    motto: "Everything has a price — so does everyone.",
    recruits: "Cutpurses, informants, and killers who can keep a secret.",
    leader: "The Spider (identity unknown, perhaps several)",
    trivia: "Debts to the Web are kept in a ledger no one has ever seen.",
  },
  VoidPact: {
    doctrine:
      "Cultists who barter sanity for power, bound to horrors that slumber beyond the stars.",
    motto: "All doors open inward.",
    recruits: "The desperate, the doomed, and seekers of forbidden truth.",
    leader: "The Mouth of the Deep, its herald",
    trivia: "Initiates dream of the same drowned city the night they join.",
  },
  WanderingCanticle: {
    doctrine:
      "A free order of traveling bards and chroniclers who shape the world by the stories they choose to tell.",
    motto: "A song outlives the sword.",
    recruits: "Musicians, tale-spinners, and charming rogues.",
    leader: "The First Voice, Maestra Ilune",
    trivia: "Their ballads secretly carry coded news between distant cities.",
  },
  StoneMonastery: {
    doctrine:
      "An ascetic brotherhood of warrior-philosophers who perfect body and mind as a single discipline.",
    motto: "Still water cuts the stone.",
    recruits: "The disciplined and the searching, taken young, trained for decades.",
    leader: "Grandmaster Hokun the Unmoving",
    trivia: "Speech is forbidden in the inner halls; they converse in gesture.",
  },
  FrostbornClans: {
    doctrine:
      "Hardy northern clans who hold that only the strong and the loyal survive the long winter.",
    motto: "The cold remembers.",
    recruits: "Born to the clans, or earned through a trial of frost and blood.",
    leader: "Jarl Brynjolf Ironwinter",
    trivia: "A clan's whole history is tattooed across its chieftain's back.",
  },
  EmberForge: {
    doctrine:
      "Smith-warriors and fire-priests who worship creation itself through flame and hammer.",
    motto: "What burns, tempers.",
    recruits: "Master smiths, the forge-born, and those reforged by fire.",
    leader: "Forgefather Durn Coalheart",
    trivia: "Each member forges the very weapon they will be buried with.",
  },
  TideReavers: {
    doctrine:
      "Corsairs and storm-callers who answer to no crown but the open sea.",
    motto: "Take the tide, or drown.",
    recruits: "Sailors, raiders, and the salt-cursed.",
    leader: "Captain Maelis Saltbane",
    trivia: "They tithe a tenth of every plunder back to the sea itself.",
  },
  UndyingLegion: {
    doctrine:
      "A deathless army that views mortality as a flaw to be conquered, never mourned.",
    motto: "Death is a deserter.",
    recruits: "Necromancers, the willing dead, and those who fear their own end.",
    leader: "The Pale General, Mordraic",
    trivia: "Its oldest soldiers predate the very kingdoms they now besiege.",
  },
  GildedCoin: {
    doctrine:
      "A cartel of merchant princes who wage war and broker peace alike — with gold.",
    motto: "Every throne sits on a ledger.",
    recruits: "Brokers, mercenaries, and anyone who can turn a profit.",
    leader: "Magnate Vex Calderro",
    trivia: "They have bought and sold three wars without lifting a blade.",
  },
  Wyrmguard: {
    doctrine:
      "Knights sworn to the old dragons, guarding their hoards and their ancient pacts.",
    motto: "By scale and oath.",
    recruits: "Chosen by a dragon — never by a person.",
    leader: "Wyrmlord Sera Vaakorn",
    trivia: "A drake bonds to one rider for life, and grieves them in death.",
  },
  Unbound: {
    doctrine:
      "Not a faction at all — wanderers, sellswords, and free souls who bow to no banner.",
    motto: "No banner, no leash.",
    recruits: "Anyone, and no one; there are no ranks to join.",
    leader: "None",
    trivia: "Many of history's greatest heroes and villains began Unbound.",
  },
};

export function factionLore(faction: string): FactionLore {
  return (
    FACTION_LORE[faction as Faction] ?? {
      doctrine: "An independent power with its own agenda.",
      motto: "—",
      recruits: "Varied.",
      leader: "Unknown",
      trivia: "Little is recorded of them.",
    }
  );
}
