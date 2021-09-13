-- CreateTable
CREATE TABLE "stripe_customer" (
    "id" SERIAL NOT NULL,
    "client_id" VARCHAR(32) NOT NULL,
    "customer_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_subscription" (
    "customer_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "price_id" TEXT NOT NULL,
    "subscription_start" TIMESTAMPTZ(6) NOT NULL,
    "subscription_end" TIMESTAMPTZ(6) NOT NULL,
    "cancelled" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL,
    "ratelimit" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customer.client_id_unique" ON "stripe_customer"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customer.customer_id_unique" ON "stripe_customer"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_subscription.customer_id_unique" ON "stripe_subscription"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_subscription.subscription_id_unique" ON "stripe_subscription"("subscription_id");
