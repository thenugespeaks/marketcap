import { IndicesBar } from "@/components/market/IndicesBar";
import { MoversTable } from "@/components/market/MoversTable";
import { TrendingStrip } from "@/components/market/TrendingStrip";
import { NewsSection } from "@/components/market/NewsSection";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Market Overview</h2>

      {/* Indices */}
      <IndicesBar />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Movers + Trending */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Market Movers</h3>
            <MoversTable />
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Trending Stocks</h3>
            <TrendingStrip />
          </section>
        </div>

        {/* Right: News */}
        <aside>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Financial News</h3>
          <NewsSection />
        </aside>
      </div>
    </main>
  );
}
