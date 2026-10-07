"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type SortBy = "Alphabetical" | "Recently Played";
type OrderBy = "Ascending" | "Descending";

type Game = {
  slug: string; // used for the subpage: /games/<slug>
  name: string;
  glyph: string; // shown on the placeholder tile until you add an image
  image?: string; // e.g. "/games/blackjack.jpg" (file lives in frontend/public/games/)
  lastPlayed: string | null; // ISO date, null = never played
};

// Placeholder data.
// TODO: lastPlayed = MAX(created_at) from the bets table, grouped by game_type,
// for the signed-in user.
const GAMES: Game[] = [
  { slug: "blackjack", name: "Blackjack", glyph: "♠", lastPlayed: "2026-10-05T19:20:00Z" },
  { slug: "poker", name: "Poker", glyph: "♦", lastPlayed: "2026-10-02T21:05:00Z" },
  { slug: "craps", name: "Craps", glyph: "⚅", lastPlayed: "2026-09-28T16:40:00Z" },
  { slug: "roulette", name: "Roulette", glyph: "◉", lastPlayed: "2026-10-06T23:10:00Z" },
  { slug: "baccarat", name: "Baccarat", glyph: "♣", lastPlayed: null },
];

const card = "rounded-2xl border border-[#C9A45C]/15 bg-[#10271F]";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A45C]";
const control =
  "rounded-xl border border-[#C9A45C]/25 bg-[#0B1F1A] text-[#F2EBDD] [color-scheme:dark] focus:border-[#C9A45C] focus:outline-2 focus:outline-offset-2 focus:outline-[#C9A45C]/50";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const time = (g: Game) => (g.lastPlayed ? Date.parse(g.lastPlayed) : 0);

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ down }: { down: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 motion-reduce:transition-none ${
        down ? "rotate-180" : ""
      }`}
    >
      <path
        d="M12 19V5m0 0-6 6m6-6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className={`${card} group flex flex-col overflow-hidden transition-colors hover:border-[#C9A45C]/50 ${focusRing}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1B4A41] to-[#0B1F1A]">
        {game.image ? (
          <Image
            src={game.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center text-7xl text-[#C9A45C]/70 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none"
          >
            {game.glyph}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <h2 className="text-lg font-semibold tracking-tight">{game.name}</h2>
        <p className="text-xs text-[#F2EBDD]/50">
          {game.lastPlayed ? `Played ${dateFmt.format(new Date(game.lastPlayed))}` : "Not played yet"}
        </p>
      </div>
    </Link>
  );
}

export default function GamesBrowser() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("Alphabetical");
  const [order, setOrder] = useState<OrderBy>("Ascending");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dir = order === "Ascending" ? 1 : -1;
    return GAMES.filter((g) => g.name.toLowerCase().includes(q)).sort((a, b) =>
      sortBy === "Alphabetical"
        ? a.name.localeCompare(b.name) * dir
        : (time(a) - time(b)) * dir
    );
  }, [search, sortBy, order]);

  function changeSort(next: SortBy) {
    setSortBy(next);
    // Newest-first is the natural order for "Recently Played"
    setOrder(next === "Recently Played" ? "Descending" : "Ascending");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Games</h1>
        <p className="mt-1 text-sm text-[#F2EBDD]/60">Pick a table and take a seat.</p>
      </div>

      {/* Controls */}
      <section className="flex flex-col gap-3 sm:flex-row" aria-label="Search and sort">
        <div className="relative flex-1">
          <label htmlFor="game-search" className="sr-only">
            Search games
          </label>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#F2EBDD]/45">
            <SearchIcon />
          </span>
          <input
            id="game-search"
            type="search"
            autoComplete="off"
            placeholder="Search games"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${control} w-full py-3 pl-11 pr-4 placeholder:text-[#F2EBDD]/35`}
          />
        </div>

        <div className="flex gap-3">
          <label htmlFor="game-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="game-sort"
            value={sortBy}
            onChange={(e) => changeSort(e.target.value as SortBy)}
            className={`${control} flex-1 px-4 py-3 text-sm sm:flex-none`}
          >
            <option>Alphabetical</option>
            <option>Recently Played</option>
          </select>

          <button
            type="button"
            onClick={() => setOrder((o) => (o === "Ascending" ? "Descending" : "Ascending"))}
            aria-label={`Sort order: ${order}. Click to reverse.`}
            className={`${control} flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-[#123028] ${focusRing}`}
          >
            <ArrowIcon down={order === "Descending"} />
            {order}
          </button>
        </div>
      </section>

      {/* Results */}
      <p className="text-sm text-[#F2EBDD]/50" aria-live="polite">
        {visible.length} {visible.length === 1 ? "game" : "games"}
      </p>

      {visible.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Games">
          {visible.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </section>
      ) : (
        <div className={`${card} p-10 text-center`}>
          <p className="font-medium">No games match “{search.trim()}”</p>
          <p className="mt-1 text-sm text-[#F2EBDD]/55">Try a different name.</p>
        </div>
      )}
    </main>
  );
}
