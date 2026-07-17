"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice, formatPercent, formatVolume, isPositive } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Tab = "active" | "gainers" | "losers";

interface Mover {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export function MoversTable() {
  const [tab, setTab] = useState<Tab>("active");
  const [data, setData] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/market/movers?tab=${tab}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "active", label: "Most Active" },
    { key: "gainers", label: "Gainers" },
    { key: "losers", label: "Losers" },
  ];

  return (
    <div>
      <div className="mb-3 flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "pb-2 px-3 text-sm font-medium border-b-2 transition-colors",
              tab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((m) => {
            const pos = isPositive(m.changePercent);
            return (
              <Link
                key={m.ticker}
                href={`/stock/${m.ticker}`}
                className="flex items-center py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.ticker}</p>
                  <p className="text-xs text-gray-500 truncate">{m.name}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(m.price)}</p>
                  <p className={`text-xs font-medium ${pos ? "text-green-600" : "text-red-500"}`}>
                    {formatPercent(m.changePercent)}
                  </p>
                </div>
                <div className="ml-8 text-right text-xs text-gray-400 w-16 shrink-0 hidden sm:block">
                  {formatVolume(m.volume)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
