"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, User, LogOut, BookMarked, BarChart2 } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

interface SearchResult {
  symbol: string;
  shortname: string;
  exchange: string;
  quoteType: string;
}

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectResult(symbol: string) {
    setQuery("");
    setOpen(false);
    router.push(`/stock/${symbol}`);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            MarketCap
          </span>
        </Link>

        {/* Search */}
        <div ref={ref} className="relative flex-1 max-w-xl">
          <div className="flex items-center rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white dark:border-gray-700 dark:bg-gray-900">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks, ETFs..."
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
            />
          </div>
          {open && (
            <div className="absolute top-full mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              {results.map((r) => (
                <button
                  key={r.symbol}
                  onClick={() => selectResult(r.symbol)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.symbol}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{r.shortname}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{r.exchange}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            Home
          </Link>
          <Link href="/watchlist" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            <BookMarked className="h-4 w-4" />
            Watchlist
          </Link>
          <Link href="/portfolio" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            <BarChart2 className="h-4 w-4" />
            Portfolio
          </Link>
        </div>

        <ThemeToggle />

        {/* User menu */}
        <div className="relative shrink-0">
          {session ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {session.user?.image ? (
                <img src={session.user.image} className="h-6 w-6 rounded-full" alt="" />
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
              <span className="hidden md:block text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                {session.user?.name ?? session.user?.email}
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
          )}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
