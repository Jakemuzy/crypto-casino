"use client";

import { useEffect, useRef, useState } from "react";

// Placeholder brand. Swap for your real name / logo.
const BRAND = "Highroll";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path
          d="M4 7h16"
          className={`origin-center transition-transform duration-200 motion-reduce:transition-none ${
            open ? "translate-y-[5px] rotate-45" : ""
          }`}
        />
        <path
          d="M4 12h16"
          className={`transition-opacity duration-150 motion-reduce:transition-none ${
            open ? "opacity-0" : ""
          }`}
        />
        <path
          d="M4 17h16"
          className={`origin-center transition-transform duration-200 motion-reduce:transition-none ${
            open ? "-translate-y-[5px] -rotate-45" : ""
          }`}
        />
      </g>
    </svg>
  );
}

function DiceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
      <g fill="currentColor">
        <circle cx="9" cy="9" r="1.3" />
        <circle cx="15" cy="9" r="1.3" />
        <circle cx="12" cy="12" r="1.3" />
        <circle cx="9" cy="15" r="1.3" />
        <circle cx="15" cy="15" r="1.3" />
      </g>
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="7" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="11" width="7" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="14" width="7" height="6" rx="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="4" y="8" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="13.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5 19.5c1-3.2 3.7-4.8 7-4.8s6 1.6 7 4.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const sideItems = [
  { label: "Dashboard", icon: <DashboardIcon /> },
  { label: "Games", icon: <DiceIcon /> },
  { label: "Wallet", icon: <WalletIcon /> },
];

const accountItems = ["Profile", "Security", "Transaction history"];

export default function AppShell({
  children,
  isAuthenticated,
  displayName,
  accountAction,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  displayName?: string;
  accountAction: React.ReactNode;
}) {  
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Escape closes whatever is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside closes the account modal
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [accountOpen]);

  const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A45C]";

  return (
    <>
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#C9A45C]/20 bg-[#0B1F1A]/95 px-3 text-[#F2EBDD] backdrop-blur sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            aria-controls="side-drawer"
            className={`grid size-10 place-items-center rounded-lg text-[#F2EBDD]/90 transition-colors hover:bg-[#F2EBDD]/10 ${focusRing}`}
          >
            <MenuIcon open={drawerOpen} />
          </button>
          <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-md bg-[#C9A45C] text-sm font-bold text-[#0B1F1A]"
            >
              H
            </span>
            {BRAND}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Balance placeholder */}
          <div className="hidden items-center gap-2 rounded-full border border-[#F2EBDD]/15 bg-[#F2EBDD]/5 py-1.5 pl-3 pr-2 sm:flex">
            <span className="font-mono text-sm tabular-nums">0.00000000</span>
            <span className="rounded-full bg-[#C9A45C] px-2 py-0.5 text-xs font-semibold text-[#0B1F1A]">
              BTC
            </span>
          </div>

          {/* Account */}
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              aria-label="Account"
              aria-haspopup="dialog"
              aria-expanded={accountOpen}
              className={`grid size-10 place-items-center rounded-full border border-[#C9A45C]/50 bg-[#123028] text-[#C9A45C] transition-colors hover:bg-[#1A4035] ${focusRing}`}
            >
              <UserIcon />
            </button>

            {accountOpen && (
              <div
                role="dialog"
                aria-label="Account"
                className="absolute right-0 top-12 w-72 origin-top-right rounded-xl border border-[#C9A45C]/25 bg-[#10271F] p-2 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center gap-3 rounded-lg px-3 py-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[#C9A45C] text-[#0B1F1A]">
                    <UserIcon />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#F2EBDD]">
                      {isAuthenticated ? displayName : "Player"}
                    </p>
                    <p className="truncate text-xs text-[#F2EBDD]/60">
                      {isAuthenticated ? "Signed in" : "Not signed in"}
                    </p>
                  </div>
                </div>

                <div className="my-1 h-px bg-[#F2EBDD]/10" />

                {accountItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-[#F2EBDD]/85 transition-colors hover:bg-[#F2EBDD]/8 ${focusRing}`}
                  >
                    {item}
                  </button>
                ))}

                <div className="my-1 h-px bg-[#F2EBDD]/10" />
                <div className="px-1 py-1">{accountAction}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 motion-reduce:transition-none ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Left drawer */}
      <aside
        id="side-drawer"
        aria-label="Main navigation"
        inert={!drawerOpen}
        className={`fixed bottom-0 left-0 top-14 z-50 w-64 border-r border-[#C9A45C]/20 bg-[#0B1F1A] p-3 text-[#F2EBDD] transition-transform duration-200 ease-out motion-reduce:transition-none ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1">
          {sideItems.map((item) => {
            const isActive = activeItem === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setActiveItem(item.label);
                  setDrawerOpen(false);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-medium transition-colors ${focusRing} ${
                  isActive
                    ? "bg-[#C9A45C]/15 text-[#C9A45C]"
                    : "text-[#F2EBDD]/80 hover:bg-[#F2EBDD]/8"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Page content sits below the fixed top bar */}
      <div className="flex min-h-full flex-1 flex-col pt-14">{children}</div>
    </>
  );
}
