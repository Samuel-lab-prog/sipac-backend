-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "collectionId" INTEGER NOT NULL,
    "poemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("collectionId","poemId")
);

-- CreateTable
CREATE TABLE "UserMention" (
    "id" SERIAL NOT NULL,
    "mentionedUserId" INTEGER NOT NULL,
    "actorUserId" INTEGER NOT NULL,
    "poemId" INTEGER,
    "commentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PoemMentions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PoemMentions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_userId_name_key" ON "Collection"("userId", "name");

-- CreateIndex
CREATE INDEX "CollectionItem_poemId_idx" ON "CollectionItem"("poemId");

-- CreateIndex
CREATE INDEX "UserMention_mentionedUserId_idx" ON "UserMention"("mentionedUserId");

-- CreateIndex
CREATE INDEX "UserMention_actorUserId_idx" ON "UserMention"("actorUserId");

-- CreateIndex
CREATE INDEX "UserMention_poemId_idx" ON "UserMention"("poemId");

-- CreateIndex
CREATE INDEX "UserMention_commentId_idx" ON "UserMention"("commentId");

-- CreateIndex
CREATE INDEX "UserMention_mentionedUserId_createdAt_idx" ON "UserMention"("mentionedUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserMention_mentionedUserId_actorUserId_poemId_commentId_key" ON "UserMention"("mentionedUserId", "actorUserId", "poemId", "commentId");

-- CreateIndex
CREATE INDEX "_PoemMentions_B_index" ON "_PoemMentions"("B");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "Poem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMention" ADD CONSTRAINT "UserMention_mentionedUserId_fkey" FOREIGN KEY ("mentionedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMention" ADD CONSTRAINT "UserMention_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMention" ADD CONSTRAINT "UserMention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PoemMentions" ADD CONSTRAINT "_PoemMentions_A_fkey" FOREIGN KEY ("A") REFERENCES "Poem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PoemMentions" ADD CONSTRAINT "_PoemMentions_B_fkey" FOREIGN KEY ("B") REFERENCES "UserMention"("id") ON DELETE CASCADE ON UPDATE CASCADE;
