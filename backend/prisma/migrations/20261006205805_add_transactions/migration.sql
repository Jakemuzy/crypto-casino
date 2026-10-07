-- This is an empty migration.
ALTER TABLE "wallets" DROP CONSTRAINT IF EXISTS wallets_balance_nonneg;
ALTER TABLE "wallets" ADD CONSTRAINT wallets_balance_nonneg CHECK (balance >= 0 AND locked_balance >= 0);
