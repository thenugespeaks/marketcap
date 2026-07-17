"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatPrice, formatPercent, isPositive } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { WatchlistButton } from "@/components/stock/WatchlistButton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockRow {
  ticker: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

export default function WatchlistPage() {
  const { data: session, status } = useSession();
  const [tickers, setTickers] = useState<string[]>([]);
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { setLoading(false); return; }
    if (status !== "authenticated") return;

    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((t: string[]) => {
        setTickers(t);
        return Promise.all(
          t.map((ticker) =>
            fetch(`/api/stock/${ticker}`)
              .then((r) => r.json())
              .then((d) => ({ ticker, name: d.name, price: d.price, change: d.change, changePercent: d.changePercent }))
              .catch(() => ({ ticker, name: ticker, price: null, change: null, changePercent: null }))
          )
        );
      })
      .then((rows) => { setStocks(rows); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Your Watchlist</h1>
        <p className="text-gray-500 mb-6">Sign in to save and track your favourite stocks.</p>
        <Link href="/login" className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : stocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <p className="text-gray-500">Your watchlist is empty.</p>
          <p className="mt-1 text-sm text-gray-400">Use the + button on any stock to add it here.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            Browse stocks →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {stocks.map((s) => {
            const pos = isPositive(s.changePercent);
            return (
              <div key={s.ticker} className="flex items-center px-4 py-3">
                <Link href={`/stock/${s.ticker}`} className="flex flex-1 items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${pos ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                    {pos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.ticker}</p>
                    <p className="text-xs text-gray-500 truncate">{s.name}</p>
                  </div>
                </Link>
                <div className="text-right mr-3 shrink-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(s.price)}</p>
                  <p className={`text-xs font-medium ${pos ? "text-green-600" : "text-red-500"}`}>
                    {formatPercent(s.changePercent)}
                  </p>
                </div>
                <WatchlistButton ticker={s.ticker} initialWatched={true} />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
