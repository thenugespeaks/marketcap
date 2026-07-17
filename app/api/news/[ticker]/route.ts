import { getStockNews, getMarketNews } from "@/lib/finnhub";

export const revalidate = 300;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker).toUpperCase();

  // Index tickers (^DJI, ^GSPC, etc.) aren't supported by Finnhub — use general market news
  const isIndex = ticker.startsWith("^");
  const news = isIndex ? await getMarketNews() : await getStockNews(ticker);
  return Response.json(news);
}
