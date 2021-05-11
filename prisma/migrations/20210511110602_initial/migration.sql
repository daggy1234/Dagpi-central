-- CreateTable
CREATE TABLE "application" (
    "uu" UUID NOT NULL,
    "appname" VARCHAR(255) NOT NULL,
    "appdescription" VARCHAR(255) NOT NULL,
    "appurl" VARCHAR(255) NOT NULL,
    "appuserid" BIGINT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "premium" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    PRIMARY KEY ("uu")
);

-- CreateTable
CREATE TABLE "tokens" (
    "userid" BIGINT NOT NULL,
    "apikey" VARCHAR(64) NOT NULL,
    "totaluses" INTEGER NOT NULL,
    "enhanced" BOOLEAN NOT NULL,
    "ratelimit" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "userid" BIGINT NOT NULL,
    "client_id" VARCHAR(32) NOT NULL,
    "client_secret" VARCHAR(256) NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cli" (
    "id" SERIAL NOT NULL,
    "client_id" VARCHAR(32) NOT NULL,
    "name" TEXT NOT NULL,
    "token" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application.appuserid_unique" ON "application"("appuserid");

-- CreateIndex
CREATE UNIQUE INDEX "tokens.apikey_unique" ON "tokens"("apikey");

-- CreateIndex
CREATE UNIQUE INDEX "user.userid_unique" ON "user"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "user.client_id_unique" ON "user"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "user.client_secret_unique" ON "user"("client_secret");

-- CreateIndex
CREATE UNIQUE INDEX "cli.client_id_unique" ON "cli"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "cli.token_unique" ON "cli"("token");
