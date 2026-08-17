-- CreateTable
CREATE TABLE "SavedPoem" (
    "userId" INTEGER NOT NULL,
    "poemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPoem_pkey" PRIMARY KEY ("userId","poemId")
);

-- CreateIndex
CREATE INDEX "SavedPoem_userId_idx" ON "SavedPoem"("userId");

-- CreateIndex
CREATE INDEX "SavedPoem_poemId_idx" ON "SavedPoem"("poemId");

-- AddForeignKey
ALTER TABLE "SavedPoem" ADD CONSTRAINT "SavedPoem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPoem" ADD CONSTRAINT "SavedPoem_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "Poem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
