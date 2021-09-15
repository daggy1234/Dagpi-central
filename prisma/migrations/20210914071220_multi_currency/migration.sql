/*
  Warnings:

  - Added the required column `currency` to the `paypal_donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `stripe_donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billing_end` to the `stripe_subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `stripe_subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "paypal_donation" ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stripe_donation" ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stripe_subscription" ADD COLUMN     "billing_end" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL;
