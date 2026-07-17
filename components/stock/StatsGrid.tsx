import { formatPrice, formatLargeNumber, formatVolume, formatPercent } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string;
  tooltip?: string;
}

interface StatsGridProps {
  data: {
    previousClose?: number | null;
    open?: number | null;
    dayLow?: number | null;
    dayHigh?: number | null;
    fiftyTwoWeekLow?: number | null;
    fiftyTwoWeekHigh?: number | null;
    marketCap?: number | null;
    volume?: number | null;
    avgVolume?: number | null;
    peRatio?: number | null;
    eps?: number | null;
    dividendYield?: number | null;
  };
}

export function StatsGrid({ data }: StatsGridProps) {
  const stats: StatItem[] = [
    { label: "Prev. Close", value: formatPrice(data.previousClose) },
    { label: "Open", value: formatPrice(data.open) },
    { label: "Day Range", value: data.dayLow != null && data.dayHigh != null ? `${formatPrice(data.dayLow)} – ${formatPrice(data.dayHigh)}` : "—", tooltip: "The stock's trading range for today" },
    { label: "52-Wk Range", value: data.fiftyTwoWeekLow != null && data.fiftyTwoWeekHigh != null ? `${formatPrice(data.fiftyTwoWeekLow)} – ${formatPrice(data.fiftyTwoWeekHigh)}` : "—" },
    { label: "Market Cap", value: formatLargeNumber(data.marketCap), tooltip: "Total market value of outstanding shares" },
    { label: "Volume", value: formatVolume(data.volume) },
    { label: "Avg Volume", value: formatVolume(data.avgVolume) },
    { label: "P/E Ratio", value: data.peRatio != null ? data.peRatio.toFixed(2) : "—", tooltip: "Price divided by earnings per share" },
    { label: "EPS", value: data.eps != null ? `$${data.eps.toFixed(2)}` : "—", tooltip: "Earnings per share (trailing 12 months)" },
    { label: "Div. Yield", value: data.dividendYield != null ? formatPercent(data.dividendYield * 100) : "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-xs text-gray-500 dark:text-gray-400" title={s.tooltip}>
            {s.label}
            {s.tooltip && <span className="ml-1 cursor-help text-gray-300">ⓘ</span>}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
