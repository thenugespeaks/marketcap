import { PriceChart } from "@/components/stock/PriceChart";
import { StatsGrid } from "@/components/stock/StatsGrid";
import { NewsSection } from "@/components/market/NewsSection";
import { WatchlistButton } from "@/components/stock/WatchlistButton";
import { formatPrice, formatChange, formatPercent, isPositive } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Globe, Users, Building2 } from "lucide-react";
import { notFound } from "next/navigation";
import { getQuote, getQuoteSummary } from "@/lib/yahoo";

async function getStockData(ticker: string) {
  const [quote, summary] = await Promise.all([
    getQuote(ticker),
    getQuoteSummary(ticker),
  ]);
  if (!quote) return null;

  const detail = summary?.summaryDetail;
  const profile = summary?.assetProfile;
  const keyStats = summary?.defaultKeyStatistics;

  return {
    ticker,
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
  };
}

export default async function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker).toUpperCase();
  const data = await getStockData(ticker);

  if (!data) notFound();

  const pos = isPositive(data.changePercent);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{data.exchange} · {data.currency}</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.name}</h1>
              <p className="text-sm font-mono text-gray-500">{data.ticker}</p>
            </div>
            <WatchlistButton ticker={ticker.toUpperCase()} />
          </div>

          {/* Price block */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatPrice(data.price)}
              </span>
              <span className={`flex items-center text-lg font-semibold ${pos ? "text-green-600" : "text-red-500"}`}>
                {pos ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                {formatChange(data.change)} ({formatPercent(data.changePercent)})
              </span>
            </div>
            {data.afterHoursPrice && (
              <p className="mt-1 text-sm text-gray-500">
                After hours: {formatPrice(data.afterHoursPrice)}{" "}
                <span className={data.afterHoursChange >= 0 ? "text-green-600" : "text-red-500"}>
                  ({formatChange(data.afterHoursChange)})
                </span>
              </p>
            )}
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <PriceChart ticker={ticker.toUpperCase()} isPositive={pos} />
          </div>

          {/* Key Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Key Statistics</h2>
            <StatsGrid data={data} />
          </div>

          {/* About */}
          {data.description && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">About {data.name}</h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-6">{data.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {data.sector && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" /> {data.sector}
                  </span>
                )}
                {data.employees && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {data.employees.toLocaleString()} employees
                  </span>
                )}
                {data.website && (
                  <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: News */}
        <aside>
          <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
            Latest News
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <NewsSection ticker={ticker.toUpperCase()} />
          </div>
        </aside>
      </div>
    </main>
  );
}
