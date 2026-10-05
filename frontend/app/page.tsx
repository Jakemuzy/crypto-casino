"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Placeholder data. TODO: replace with values queried from the DB.    */
/* ------------------------------------------------------------------ */

const STATS = {
  wins: 128,
  losses: 94,
  profit: 0.4821, // BTC
  winsThisWeek: 12,
  lossesThisWeek: 7,
  profitThisWeek: 0.0386,
};

type Period = "Daily" | "Weekly" | "Monthly";

const EARNINGS: Record<
  Period,
  { total: number; delta: number; unit: string; labels: string[]; bars: number[] }
> = {
  Daily: {
    total: 0.0214,
    delta: 12.4,
    unit: "day",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    bars: [0.004, -0.006, 0.011, 0.007, -0.003, 0.016, 0.0214],
  },
  Weekly: {
    total: 0.0952,
    delta: -4.1,
    unit: "week",
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
    bars: [0.031, 0.062, -0.018, 0.074, 0.101, 0.099, 0.0952],
  },
  Monthly: {
    total: 0.3877,
    delta: 21.8,
    unit: "month",
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    bars: [0.12, -0.05, 0.19, 0.27, 0.32, 0.3877],
  },
};

// Cumulative profit over the last 30 days (BTC)
const PROFIT_SERIES = [
  0, 0.012, 0.009, 0.031, 0.027, 0.05, 0.044, 0.038, 0.071, 0.092, 0.085, 0.11,
  0.104, 0.097, 0.13, 0.158, 0.149, 0.181, 0.176, 0.21, 0.236, 0.228, 0.205,
  0.262, 0.301, 0.294, 0.338, 0.371, 0.412, 0.4821,
];

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const GAIN = "#7FD1A0";
const LOSS = "#E5735E";

const fmtBtc = (n: number, digits = 4) =>
  `${n > 0 ? "+" : n < 0 ? "-" : ""}${Math.abs(n).toFixed(digits)}`;

const card = "rounded-2xl border border-[#C9A45C]/15 bg-[#10271F]";

/* ------------------------------------------------------------------ */
/* Stat card                                                            */
/* ------------------------------------------------------------------ */

function StatCard({
  title,
  value,
  note,
  children,
}: {
  title: string;
  value: string;
  note: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${card} flex flex-col gap-3 p-5`}>
      <p className="text-sm text-[#F2EBDD]/60">{title}</p>
      <p className="text-3xl font-semibold tracking-tight tabular-nums text-[#F2EBDD]">
        {value}
      </p>
      {children}
      <p className="mt-auto text-xs text-[#F2EBDD]/50">{note}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Earnings card with period toggle                                     */
/* ------------------------------------------------------------------ */

function EarningsCard() {
  const [period, setPeriod] = useState<Period>("Daily");
  const data = EARNINGS[period];
  const max = Math.max(...data.bars.map(Math.abs));
  const positive = data.delta >= 0;

  return (
    <div className={`${card} flex flex-col gap-5 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#F2EBDD]/60">Earnings</p>
        <div
          role="group"
          aria-label="Earnings period"
          className="flex rounded-full border border-[#F2EBDD]/10 bg-[#0B1F1A] p-1"
        >
          {(Object.keys(EARNINGS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A45C] ${
                period === p
                  ? "bg-[#C9A45C] text-[#0B1F1A]"
                  : "text-[#F2EBDD]/70 hover:text-[#F2EBDD]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="flex items-baseline gap-2 text-3xl font-semibold tracking-tight tabular-nums">
          {fmtBtc(data.total)}
          <span className="text-sm font-medium text-[#C9A45C]">BTC</span>
        </p>
        <p
          className="mt-1 text-sm tabular-nums"
          style={{ color: positive ? GAIN : LOSS }}
        >
          {positive ? "+" : ""}
          {data.delta.toFixed(1)}%{" "}
          <span className="text-[#F2EBDD]/50">vs previous {data.unit}</span>
        </p>
      </div>

      {/* Bars */}
      <div className="flex h-28 items-end gap-2" role="img" aria-label={`${period} earnings chart`}>
        {data.bars.map((v, i) => {
          const h = Math.max((Math.abs(v) / max) * 100, 6);
          const last = i === data.bars.length - 1;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-300 motion-reduce:transition-none"
                  style={{
                    height: `${h}%`,
                    background: v < 0 ? LOSS : "#C9A45C",
                    opacity: last ? 1 : 0.4,
                  }}
                />
              </div>
              <span className="text-[11px] text-[#F2EBDD]/45">{data.labels[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profitability chart (hand-rolled SVG, no dependencies)               */
/* ------------------------------------------------------------------ */

function ProfitChart() {
  const W = 640;
  const H = 260;
  const left = 52;
  const right = 16;
  const top = 16;
  const bottom = 28;

  const min = 0;
  const max = Math.ceil(Math.max(...PROFIT_SERIES) * 10) / 10; // round up to 0.1
  const n = PROFIT_SERIES.length;

  const x = (i: number) => left + (i / (n - 1)) * (W - left - right);
  const y = (v: number) => top + (1 - (v - min) / (max - min)) * (H - top - bottom);

  // Smooth curve with horizontal control points (no overshoot)
  let line = `M ${x(0)} ${y(PROFIT_SERIES[0])}`;
  for (let i = 1; i < n; i++) {
    const mid = (x(i - 1) + x(i)) / 2;
    line += ` C ${mid} ${y(PROFIT_SERIES[i - 1])}, ${mid} ${y(PROFIT_SERIES[i])}, ${x(i)} ${y(PROFIT_SERIES[i])}`;
  }
  const area = `${line} L ${x(n - 1)} ${H - bottom} L ${x(0)} ${H - bottom} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + t * (max - min));
  const lastX = x(n - 1);
  const lastY = y(PROFIT_SERIES[n - 1]);

  return (
    <div className={`${card} flex flex-col gap-4 p-5 lg:col-span-2`}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-[#F2EBDD]/60">Profitability, last 30 days</p>
          <p className="mt-1 flex items-baseline gap-2 text-3xl font-semibold tracking-tight tabular-nums">
            {fmtBtc(STATS.profit)}
            <span className="text-sm font-medium text-[#C9A45C]">BTC</span>
          </p>
        </div>
        <p className="text-sm tabular-nums" style={{ color: GAIN }}>
          {fmtBtc(STATS.profitThisWeek)} <span className="text-[#F2EBDD]/50">this week</span>
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Cumulative profit over the last 30 days, trending upward"
      >
        <defs>
          <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A45C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#C9A45C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={left}
              x2={W - right}
              y1={y(t)}
              y2={y(t)}
              stroke="#F2EBDD"
              strokeOpacity="0.08"
            />
            <text
              x={left - 10}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#F2EBDD"
              fillOpacity="0.45"
            >
              {t.toFixed(2)}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#profitFill)" />
        <path
          d={line}
          fill="none"
          stroke="#C9A45C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx={lastX} cy={lastY} r="9" fill="#C9A45C" fillOpacity="0.2" />
        <circle cx={lastX} cy={lastY} r="4.5" fill="#C9A45C" stroke="#10271F" strokeWidth="2" />

        <text x={left} y={H - 6} fontSize="11" fill="#F2EBDD" fillOpacity="0.45">
          30 days ago
        </text>
        <text
          x={W - right}
          y={H - 6}
          textAnchor="end"
          fontSize="11"
          fill="#F2EBDD"
          fillOpacity="0.45"
        >
          Today
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const total = STATS.wins + STATS.losses;
  const winRate = total === 0 ? 0 : (STATS.wins / total) * 100;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[#F2EBDD]/60">Your results across all games.</p>
      </div>

      {/* Stat row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Summary">
        <StatCard
          title="Wins"
          value={STATS.wins.toLocaleString()}
          note={`+${STATS.winsThisWeek} this week`}
        />
        <StatCard
          title="Losses"
          value={STATS.losses.toLocaleString()}
          note={`+${STATS.lossesThisWeek} this week`}
        />
        <StatCard title="Win rate" value={`${winRate.toFixed(1)}%`} note={`${total} games played`}>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5735E]/40"
            role="img"
            aria-label={`${winRate.toFixed(0)} percent of games won`}
          >
            <div className="h-full rounded-full bg-[#7FD1A0]" style={{ width: `${winRate}%` }} />
          </div>
        </StatCard>
        <StatCard
          title="Total profit"
          value={`${fmtBtc(STATS.profit)} BTC`}
          note={`${fmtBtc(STATS.profitThisWeek)} this week`}
        />
      </section>

      {/* Chart + earnings */}
      <section className="grid gap-4 lg:grid-cols-3" aria-label="Performance">
        <ProfitChart />
        <EarningsCard />
      </section>
    </main>
  );
}
