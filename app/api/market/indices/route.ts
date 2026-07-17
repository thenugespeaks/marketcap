import { getMultipleQuotes, INDEX_TICKERS } from "@/lib/yahoo";
import { NextRequest } from "next/server";

export const revalidate = 60;

export async function GET(_req: NextRequest) {
  const symbols = INDEX_TICKERS.map((i) => i.symbol);
  const quotes = await getMultipleQuotes(symbols);

  const data = INDEX_TICKERS.map((index, i) => {
    const q = quotes[i]?.data;
    return {
      symbol: index.symbol,
      name: index.name,
      price: q?.regularMarketPrice ?? null,
      change: q?.regularMarketChange ?? null,
      changePercent: q?.regularMarketChangePercent ?? null,
    };
  });

  return Response.json(data);
}
