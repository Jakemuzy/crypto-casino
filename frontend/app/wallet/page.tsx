import { redirect } from "next/navigation";
import WalletPanel, { type Tx } from "../components/WalletPanel";
import { db } from "../../lib/db";
import { getCurrentUser } from "../../lib/user";
import { CURRENCY } from "../../lib/wallet-config";
import { deposit, withdraw } from "./actions";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/"); // not signed in: no access to the wallet

  const wallet = await db.wallet.findUnique({
    where: { userId_currency: { userId: user.id, currency: CURRENCY } },
  });

  const rows = wallet
    ? await db.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  const history: Tx[] = rows.map((r) => ({
    id: r.id,
    type: r.type === "DEPOSIT" ? "Deposit" : "Withdraw",
    amount: r.amount.toNumber(),
    status: titleCase(r.status),
    when: `${dateFmt.format(r.createdAt)} UTC`,
  }));

  return (
    <WalletPanel
      initialBalance={wallet ? wallet.balance.toNumber() : 0}
      initialHistory={history}
      onDeposit={deposit}
      onWithdraw={withdraw}
    />
  );
}
