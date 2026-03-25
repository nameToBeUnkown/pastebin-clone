-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paste" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "viewLimit" INTEGER,
    "passwordHash" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT,
    CONSTRAINT "Paste_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Paste" ("authorId", "content", "createdAt", "expiresAt", "id", "isPublic", "language", "title", "views") SELECT "authorId", "content", "createdAt", "expiresAt", "id", "isPublic", "language", "title", "views" FROM "Paste";
DROP TABLE "Paste";
ALTER TABLE "new_Paste" RENAME TO "Paste";
CREATE INDEX "Paste_authorId_idx" ON "Paste"("authorId");
CREATE INDEX "Paste_createdAt_idx" ON "Paste"("createdAt");
CREATE INDEX "Paste_isPublic_createdAt_idx" ON "Paste"("isPublic", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
