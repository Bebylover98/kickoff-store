-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationCodeExpiry" TIMESTAMP(3);
