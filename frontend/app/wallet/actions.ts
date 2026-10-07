"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "../../lib/generated/prisma/client";
import { db } from "../../lib/db";
import { getCurrentUser } from "../../lib/user";
import { CURRENCY, WITHDRAWAL_FEE_BTC } from "../../lib/wallet-config";

function toDecimal(n: number) {
  if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid amount");
  return new Prisma.Decimal(n.toFixed(8));
}

// Server actions are public endpoints: always re-check auth here, never
// rely on the page having done it.
async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function deposit(amount: number) {
  const user = await requireUser();
  const value = toDecimal(amount);

  await db.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId_currency: { userId: user.id, currency: CURRENCY } },
      update: {},
      create: { userId: user.id, currency: CURRENCY },
    });

    const record = await tx.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: "DEPOSIT",
        amount: value,
        status: "COMPLETED", // simulated; real deposits start as PENDING
      },
    });

    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: value } },
    });

    await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        amount: value,
        balanceAfter: updated.balance,
        type: "DEPOSIT",
        referenceType: "TRANSACTION",
        referenceId: record.id,
        idempotencyKey: `deposit:${record.id}`,
      },
    });
  });

  revalidatePath("/wallet");
}

export async function withdraw(amount: number, address: string) {
  const user = await requireUser();
  const value = toDecimal(amount);
  const fee = new Prisma.Decimal(WITHDRAWAL_FEE_BTC);
  const total = value.plus(fee);

  const dest = address.trim();
  // TODO: real address validation for your chosen network
  if (dest.length < 20 || dest.length > 100) throw new Error("Invalid address");

  await db.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId_currency: { userId: user.id, currency: CURRENCY } },
    });
    if (!wallet) throw new Error("Insufficient balance");

    const record = await tx.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: "WITHDRAWAL",
        amount: value,
        fee,
        address: dest,
        status: "COMPLETED", // simulated; real withdrawals start as PENDING
      },
    });

    // Atomic check-and-debit: the WHERE clause is the balance check, so two
    // simultaneous withdrawals can never both succeed on the same funds.
    const debited = await tx.wallet.updateMany({
      where: { id: wallet.id, balance: { gte: total } },
      data: { balance: { decrement: total } },
    });
    if (debited.count === 0) throw new Error("Insufficient balance"); // rolls back

    const updated = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });

    await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        amount: total.neg(),
        balanceAfter: updated.balance,
        type: "WITHDRAWAL",
        referenceType: "TRANSACTION",
        referenceId: record.id,
        idempotencyKey: `withdrawal:${record.id}`,
      },
    });
  });

  revalidatePath("/wallet");
}
