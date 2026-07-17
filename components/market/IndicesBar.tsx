"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice, formatPercent, isPositive } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface IndexData {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

const SYMBOL_TO_PATH: Record<string, string> = {
  "^GSPC": "/stock/%5EGSPC",
  "^DJI": "/stock/%5EDJI",
  "^IXIC": "/stock/%5EIXIC",
  "^RUT": "/stock/%5ERUT",
  "^VIX": "/stock/%5EVIX",
};

export function IndicesBar() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/indices")
      .then((r) => r.json())
      .then((d) => { setIndices(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-36 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {indices.map((idx) => {
        const pos = isPositive(idx.changePercent);
        return (
          <Link
            key={idx.symbol}
            href={SYMBOL_TO_PATH[idx.symbol] ?? `/stock/${encodeURIComponent(idx.symbol)}`}
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{idx.name}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {formatPrice(idx.price)}
            </p>
            <p className={`text-xs font-medium ${pos ? "text-green-600" : "text-red-500"}`}>
              {formatPercent(idx.changePercent)}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
