const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "";
const BASE = "https://finnhub.io/api/v1";

async function finnhubFetch(path: string) {
  if (!FINNHUB_KEY) return null;
  const res = await fetch(`${BASE}${path}&token=${FINNHUB_KEY}`, {
    next: { revalidate: 300 }, // cache 5 minutes
  });
  if (!res.ok) return null;
  return res.json();
}

export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  related: string;
}

export async function getMarketNews(): Promise<NewsItem[]> {
  const data = await finnhubFetch("/news?category=general");
  return data?.slice(0, 20) ?? [];
}

export async function getStockNews(ticker: string): Promise<NewsItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const data = await finnhubFetch(`/company-news?symbol=${ticker}&from=${weekAgo}&to=${today}`);
  return data?.slice(0, 10) ?? [];
}
