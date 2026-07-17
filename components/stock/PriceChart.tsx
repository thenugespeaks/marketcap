"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Range = "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y";

interface HistoryPoint {
  date: string;
  close: number;
}

const RANGES: Range[] = ["1D", "5D", "1M", "6M", "1Y", "5Y"];

function formatDate(dateStr: string, range: Range): string {
  const d = new Date(dateStr);
  if (range === "1D" || range === "5D") return format(d, "MMM d");
  if (range === "1M" || range === "6M") return format(d, "MMM d");
  return format(d, "MMM yyyy");
}

interface Props {
  ticker: string;
  isPositive: boolean;
}

export function PriceChart({ ticker, isPositive }: Props) {
  const [range, setRange] = useState<Range>("1M");
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stock/${encodeURIComponent(ticker)}/history?range=${range}`)
      .then((r) => r.json())
      .then((d: HistoryPoint[]) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ticker, range]);

  const color = isPositive ? "#16a34a" : "#dc2626";
  const fillColor = isPositive ? "#dcfce7" : "#fee2e2";

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: HistoryPoint; value: number }> }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs text-gray-500">{formatDate(payload[0].payload.date, range)}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  };

  return (
    <div>
      {/* Range selector */}
      <div className="mb-4 flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              range === r
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v, range)}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill="url(#colorGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
