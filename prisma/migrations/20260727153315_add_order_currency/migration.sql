/*
  Warnings:

  - The `fitType` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `partnerSize` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `size` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NPR';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "fitType",
ADD COLUMN     "fitType" TEXT,
DROP COLUMN "partnerSize",
ADD COLUMN     "partnerSize" TEXT,
DROP COLUMN "size",
ADD COLUMN     "size" TEXT;
