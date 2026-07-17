import { getQuote, getQuoteSummary } from "@/lib/yahoo";

export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker);
  const [quote, summary] = await Promise.all([
    getQuote(ticker.toUpperCase()),
    getQuoteSummary(ticker.toUpperCase()),
  ]);

  if (!quote) {
    return Response.json({ error: "Ticker not found" }, { status: 404 });
  }

  const detail = summary?.summaryDetail;
  const profile = summary?.assetProfile;
  const keyStats = summary?.defaultKeyStatistics;

  return Response.json({
    ticker: ticker.toUpperCase(),
    name: quote.shortName ?? quote.longName ?? ticker,
    exchange: quote.exchange,
    currency: quote.currency,
    price: quote.regularMarketPrice,
    previousClose: quote.regularMarketPreviousClose,
    open: quote.regularMarketOpen,
    change: quote.regularMarketChange,
    changePercent: quote.regularMarketChangePercent,
    dayLow: quote.regularMarketDayLow,
    dayHigh: quote.regularMarketDayHigh,
    volume: quote.regularMarketVolume,
    avgVolume: quote.averageDailyVolume3Month,
    marketCap: quote.marketCap,
    fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
    fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
    peRatio: detail?.trailingPE ?? keyStats?.trailingEps ?? null,
    dividendYield: detail?.dividendYield ?? null,
    eps: keyStats?.trailingEps ?? null,
    description: profile?.longBusinessSummary ?? null,
    sector: profile?.sector ?? null,
    industry: profile?.industry ?? null,
    website: profile?.website ?? null,
    employees: profile?.fullTimeEmployees ?? null,
    afterHoursPrice: quote.postMarketPrice ?? null,
    afterHoursChange: quote.postMarketChange ?? null,
  });
}
