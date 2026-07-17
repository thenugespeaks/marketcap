"use client";

import { useEffect, useState } from "react";
import { NewsCard } from "@/components/stock/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
}

export function NewsSection({ ticker }: { ticker?: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = ticker ? `/api/news/${encodeURIComponent(ticker)}` : "/api/news";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setNews(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    );
  }

  if (!news.length) {
    return (
      <p className="text-sm text-gray-400 py-4">
        {ticker ? "No recent news for this stock." : "No news available. Add a Finnhub API key to see live news."}
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {news.map((item) => (
        <NewsCard key={item.id} {...item} />
      ))}
    </div>
  );
}
