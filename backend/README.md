This is documentation regarding how to use the local DB, Prod DB and subsequent migrations.

Dev: change schema.prisma, then run migrate dev --name <change>. Use --create-only whenever you need hand-written SQL.
Prod: only run npx prisma migrate deploy. Commit prisma/migrations/ to git and never edit an applied migration.
Next migrations, in order: deposits and deposit addresses, withdrawals, bets and seed pairs, then audit log, KYC, and responsible gambling tables. Each is a separate, additive migration.
