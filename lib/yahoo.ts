import "server-only";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const YahooFinance = require("yahoo-finance2").default as any;
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function getQuote(ticker: string): Promise<any> {
  try {
    return await yahooFinance.quote(ticker);
  } catch {
    return null;
  }
}

export async function getQuoteSummary(ticker: string): Promise<any> {
  try {
    return await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "assetProfile", "financialData", "defaultKeyStatistics"],
    });
  } catch {
    return null;
  }
}

export async function getHistory(ticker: string, period1: Date, interval: "1d" | "1wk" | "1mo" = "1d"): Promise<any[]> {
  try {
    return await yahooFinance.historical(ticker, { period1, period2: new Date(), interval });
  } catch {
    return [];
  }
}

export async function searchTickers(query: string): Promise<any[]> {
  try {
    const results = await yahooFinance.search(query, { newsCount: 0 });
    return (results.quotes as any[])
      .slice(0, 8)
      .filter((q: any) => q.quoteType === "EQUITY" || q.quoteType === "ETF" || q.quoteType === "CRYPTOCURRENCY");
  } catch {
    return [];
  }
}

export async function getMultipleQuotes(tickers: string[]): Promise<{ ticker: string; data: any }[]> {
  const results = await Promise.all(tickers.map((t) => getQuote(t)));
  return tickers.map((ticker, i) => ({ ticker, data: results[i] }));
}

export { INDEX_TICKERS, TRENDING_TICKERS } from "./constants";
