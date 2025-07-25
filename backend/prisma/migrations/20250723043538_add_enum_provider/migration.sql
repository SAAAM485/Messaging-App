/*
  Warnings:

  - The `provider` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId");
