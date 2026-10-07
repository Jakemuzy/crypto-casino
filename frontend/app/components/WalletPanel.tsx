"use client";

import { useState } from "react";

type Tab = "Deposit" | "Withdraw";
type Tx = { id: string; type: Tab; amount: number; status: string; when: string };

/* Placeholder values. TODO: replace with real data. */
const FEE = 0.0001; // flat network fee in BTC (placeholder)
const USD_RATE = 67250; // placeholder BTC/USD rate
const QUICK_DEPOSITS = [0.01, 0.05, 0.1];

/* TODO: This should be taken from db */
const INITIAL_HISTORY: Tx[] = [
  { id: "t3", type: "Deposit", amount: 0.05, status: "Completed", when: "Today, 14:32" },
  { id: "t2", type: "Withdraw", amount: 0.02, status: "Completed", when: "Yesterday, 21:07" },
  { id: "t1", type: "Deposit", amount: 0.1, status: "Completed", when: "Oct 2, 09:15" },
];

const GAIN = "#7FD1A0";
const card = "rounded-2xl border border-[#C9A45C]/15 bg-[#10271F]";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A45C]";
const inputClass =
  "w-full rounded-xl border border-[#C9A45C]/25 bg-[#0B1F1A] px-4 py-3 text-[#F2EBDD] placeholder:text-[#F2EBDD]/30 focus:border-[#C9A45C] focus:outline-2 focus:outline-offset-2 focus:outline-[#C9A45C]/50";

const round8 = (n: number) => Math.round(n * 1e8) / 1e8;

export default function WalletPanel({
  initialBalance,
  onDeposit,
  onWithdraw,
}: {
  initialBalance: number;
  onDeposit: (amount: number) => Promise<void>;
  onWithdraw: (amount: number, address: string) => Promise<void>;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [tab, setTab] = useState<Tab>("Deposit");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Tx[]>(INITIAL_HISTORY);

  const value = parseFloat(amount);
  const validValue = Number.isFinite(value) && value > 0;
  const isWithdraw = tab === "Withdraw";

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
    setNotice(null);
    setAmount("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!validValue) return setError("Enter an amount greater than 0.");
    if (isWithdraw) {
      // TODO: real address validation for your chosen network
      if (address.trim().length < 20) return setError("Enter a valid destination address.");
      if (value + FEE > balance) return setError("Insufficient balance.");
    }

    setBusy(true);
    try {
      if (isWithdraw) await onWithdraw(value, address.trim());
      else await onDeposit(value);

      setBalance((b) => round8(isWithdraw ? b - value - FEE : b + value));
      setHistory((h) => [
        {
          id: crypto.randomUUID(),
          type: tab,
          amount: value,
          status: "Completed",
          when: "Just now",
        },
        ...h,
      ]);
      setNotice(`${tab} of ${value.toFixed(4)} BTC simulated successfully.`);
      setAmount("");
      if (isWithdraw) setAddress("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wallet</h1>
        <p className="mt-1 text-sm text-[#F2EBDD]/60">Deposit funds or withdraw your winnings.</p>
      </div>

      {/* Balance hero */}
      <section
        aria-label="Balance"
        className="rounded-2xl border border-[#C9A45C]/30 bg-gradient-to-br from-[#1B4A41] via-[#12332B] to-[#10271F] p-6 sm:p-8"
      >
        <p className="text-sm text-[#F2EBDD]/65">Current balance</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-3 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
          {balance.toFixed(8)}
          <span className="text-lg font-medium text-[#C9A45C]">BTC</span>
        </p>
        <p className="mt-2 text-sm text-[#F2EBDD]/55 tabular-nums">
          ≈ ${(balance * USD_RATE).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
        </p>
        <dl className="mt-6 flex gap-8 text-sm">
          <div>
            <dt className="text-[#F2EBDD]/50">Available</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{balance.toFixed(4)} BTC</dd>
          </div>
          <div>
            <dt className="text-[#F2EBDD]/50">Pending</dt>
            <dd className="mt-0.5 font-medium tabular-nums">0.0000 BTC</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Deposit / Withdraw */}
        <section className={`${card} p-5 sm:p-6 lg:col-span-3`} aria-label="Deposit or withdraw">
          <div
            role="group"
            aria-label="Transaction type"
            className="mb-6 inline-flex rounded-full border border-[#F2EBDD]/10 bg-[#0B1F1A] p-1"
          >
            {(["Deposit", "Withdraw"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => switchTab(t)}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
                  tab === t
                    ? "bg-[#C9A45C] text-[#0B1F1A]"
                    : "text-[#F2EBDD]/70 hover:text-[#F2EBDD]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="wallet-amount" className="text-sm font-medium">
                  Amount (BTC)
                </label>
                {isWithdraw && (
                  <button
                    type="button"
                    onClick={() => setAmount(Math.max(round8(balance - FEE), 0).toFixed(8))}
                    className={`rounded text-xs font-medium text-[#C9A45C] hover:underline ${focusRing}`}
                  >
                    Max
                  </button>
                )}
              </div>
              <input
                id="wallet-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputClass} tabular-nums`}
              />
              {!isWithdraw && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK_DEPOSITS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q.toString())}
                      className={`rounded-full border border-[#C9A45C]/25 px-3 py-1 text-xs text-[#F2EBDD]/80 transition-colors hover:bg-[#C9A45C]/10 ${focusRing}`}
                    >
                      {q} BTC
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isWithdraw && (
              <div>
                <label htmlFor="wallet-address" className="mb-2 block text-sm font-medium">
                  Destination address
                </label>
                <input
                  id="wallet-address"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="bc1q..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {isWithdraw && validValue && (
              <dl className="flex flex-col gap-1.5 rounded-xl bg-[#0B1F1A] px-4 py-3 text-sm tabular-nums">
                <div className="flex justify-between">
                  <dt className="text-[#F2EBDD]/55">Network fee</dt>
                  <dd>{FEE.toFixed(4)} BTC</dd>
                </div>
                <div className="flex justify-between font-medium">
                  <dt className="text-[#F2EBDD]/55">Total deducted</dt>
                  <dd>{(value + FEE).toFixed(4)} BTC</dd>
                </div>
              </dl>
            )}

            {error && (
              <p role="alert" className="text-sm text-[#E5735E]">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="text-sm" style={{ color: GAIN }}>
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`rounded-xl bg-[#C9A45C] px-4 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors hover:bg-[#D8B56D] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              {busy ? "Processing…" : isWithdraw ? "Withdraw" : "Deposit"}
            </button>
          </form>
        </section>

        {/* Recent transactions */}
        <section className={`${card} p-5 sm:p-6 lg:col-span-2`} aria-label="Recent transactions">
          <h2 className="text-sm font-medium text-[#F2EBDD]/60">Recent transactions</h2>
          <ul className="mt-4 flex flex-col divide-y divide-[#F2EBDD]/10">
            {history.slice(0, 6).map((tx) => {
              const dep = tx.type === "Deposit";
              return (
                <li key={tx.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{dep ? "Deposit" : "Withdrawal"}</p>
                    <p className="text-xs text-[#F2EBDD]/50">
                      {tx.when} · {tx.status}
                    </p>
                  </div>
                  <p
                    className="text-sm font-medium tabular-nums"
                    style={{ color: dep ? GAIN : "#F2EBDD" }}
                  >
                    {dep ? "+" : "-"}
                    {tx.amount.toFixed(4)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
