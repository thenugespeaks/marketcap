"use client";

import Link from "next/link";
import { formatPrice, formatPercent, isPositive } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { WatchlistButton } from "./WatchlistButton";

interface StockCardProps {
  ticker: string;
  name: string;
  price: number | null;
  changePercent: number | null;
}

export function StockCard({ ticker, name, price, changePercent }: StockCardProps) {
  const pos = isPositive(changePercent);

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="absolute top-3 right-3">
        <WatchlistButton ticker={ticker} />
      </div>
      <Link href={`/stock/${ticker}`} className="block">
        <div className="flex items-start gap-2 pr-8">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              pos ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
            }`}
          >
            {pos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{ticker}</p>
            <p className="truncate text-xs text-gray-500">{name}</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(price)}</p>
          <p className={`text-sm font-medium ${pos ? "text-green-600" : "text-red-500"}`}>
            {formatPercent(changePercent)}
          </p>
        </div>
      </Link>
    </div>
  );
}
