-- CreateTable
CREATE TABLE "bets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "game_type" TEXT NOT NULL,
    "wager" DECIMAL(38,18) NOT NULL,
    "payout" DECIMAL(38,18) NOT NULL,
    "profit" DECIMAL(38,18) NOT NULL,
    "outcome" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bets_user_id_created_at_idx" ON "bets"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "bets_user_id_outcome_idx" ON "bets"("user_id", "outcome");
