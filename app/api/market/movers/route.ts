import { getMultipleQuotes, TRENDING_TICKERS } from "@/lib/yahoo";
import { NextRequest } from "next/server";

export const revalidate = 120;

// Additional tickers for movers simulation
const EXTENDED_TICKERS = [
  ...TRENDING_TICKERS,
  "AMD", "INTC", "CRM", "ADBE", "PYPL", "UBER", "LYFT", "SNAP",
  "TWTR", "SPOT", "SHOP", "SQ", "ROKU", "ZM", "DOCU", "PLTR",
];

export async function GET(req: NextRequest) {
  const tab = req.nextUrl.searchParams.get("tab") ?? "active";
  const quotes = await getMultipleQuotes(EXTENDED_TICKERS);

  const enriched = quotes
    .filter((q) => q.data != null)
    .map((q) => ({
      ticker: q.ticker,
      name: q.data!.shortName ?? q.ticker,
      price: q.data!.regularMarketPrice ?? 0,
      change: q.data!.regularMarketChange ?? 0,
      changePercent: q.data!.regularMarketChangePercent ?? 0,
      volume: q.data!.regularMarketVolume ?? 0,
    }));

  let sorted: typeof enriched;
  if (tab === "gainers") {
    sorted = [...enriched].sort((a, b) => b.changePercent - a.changePercent);
  } else if (tab === "losers") {
    sorted = [...enriched].sort((a, b) => a.changePercent - b.changePercent);
  } else {
    sorted = [...enriched].sort((a, b) => b.volume - a.volume);
  }

  return Response.json(sorted.slice(0, 10));
}
