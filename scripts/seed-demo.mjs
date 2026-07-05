import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demo = {
  name: "Tyr",
  title: "Oathkeeper",
  age: 24,
  gender: "Female",
  race: "Human",
  alignment: "Chaotic Justice",
  charClass: "Knight",
  faction: "IronCrown",
  languages: JSON.stringify(["Polish", "Latin", "English", "Canine"]),
  stats: JSON.stringify({
    strength: 82,
    constitution: 74,
    agility: 61,
    endurance: 78,
    intelligence: 55,
    charisma: 67,
    luck: 40,
    unique: 88,
  }),
  bio: JSON.stringify([
    "In an era of turmoil, Tyr's family was once among the most loyal knightly houses of the realm. However, a sudden rebellion took everything from her.",
    "As a child, she was rescued by surviving knights and taken to the kingdom's borders, where she endured years of harsh training in the unforgiving wilderness.",
    "Through trials of steel and fire, she forged an unbreakable will. By the time she returned to the capital, she was no longer a helpless girl but a knight ready to wield her sword in the kingdom's defense.",
  ]),
  themeKey: "gold",
  classIconId: "GiBroadsword",
  factionIconId: "GiCrown",
  appearanceTags:
    "1girl, solo, full body, standing, blonde hair, hair bun, blue eyes, ornate black plate armor, red cape, longsword, knight, gauntlets, simple background, white background, looking at viewer, masterpiece, high score, great score, absurdres",
  seed: 12345,
};

const created = await prisma.character.create({ data: demo });
console.log("Created demo character:", created.id);
await prisma.$disconnect();
