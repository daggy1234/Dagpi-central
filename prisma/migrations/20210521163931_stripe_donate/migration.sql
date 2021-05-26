-- CreateTable
CREATE TABLE "stripe_donation" (
    "id" SERIAL NOT NULL,
    "client_id" VARCHAR(32) NOT NULL,
    "receipt" TEXT NOT NULL,
    "charge_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);
