"use client";

import { useEffect, useState } from "react";
import { TRENDING_TICKERS } from "@/lib/constants";
import { StockCard } from "@/components/stock/StockCard";
import { Skeleton } from "@/components/ui/skeleton";

interface QuoteData {
  ticker: string;
  name: string;
  price: number | null;
  changePercent: number | null;
}

export function TrendingStrip() {
  const [stocks, setStocks] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      TRENDING_TICKERS.map((t) =>
        fetch(`/api/stock/${t}`)
          .then((r) => r.json())
          .then((d) => ({ ticker: t, name: d.name, price: d.price, changePercent: d.changePercent }))
          .catch(() => ({ ticker: t, name: t, price: null, changePercent: null }))
      )
    ).then((results) => {
      setStocks(results);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stocks.map((s) => (
        <StockCard key={s.ticker} {...s} />
      ))}
    </div>
  );
}
