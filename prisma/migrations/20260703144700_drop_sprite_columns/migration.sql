-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "alignment" TEXT NOT NULL,
    "charClass" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "stats" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "themeKey" TEXT NOT NULL DEFAULT 'gold',
    "classIconId" TEXT NOT NULL,
    "factionIconId" TEXT NOT NULL,
    "appearanceTags" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "heroImagePath" TEXT,
    "userPrefs" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Character" ("age", "alignment", "appearanceTags", "bio", "charClass", "classIconId", "createdAt", "faction", "factionIconId", "gender", "heroImagePath", "id", "languages", "name", "race", "seed", "stats", "themeKey", "title", "updatedAt", "userPrefs") SELECT "age", "alignment", "appearanceTags", "bio", "charClass", "classIconId", "createdAt", "faction", "factionIconId", "gender", "heroImagePath", "id", "languages", "name", "race", "seed", "stats", "themeKey", "title", "updatedAt", "userPrefs" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
