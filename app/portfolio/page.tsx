"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatPrice, formatLargeNumber, isPositive } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2 } from "lucide-react";

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  buyPrice: number;
}

interface HoldingWithMarket extends Holding {
  currentPrice: number | null;
  name: string;
  value: number | null;
  cost: number;
  pnl: number | null;
  pnlPct: number | null;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const [holdings, setHoldings] = useState<HoldingWithMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ticker: "", shares: "", buyPrice: "" });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadHoldings() {
    const raw: Holding[] = await fetch("/api/portfolio").then((r) => r.json());
    const enriched = await Promise.all(
      raw.map(async (h) => {
        const quote = await fetch(`/api/stock/${h.ticker}`)
          .then((r) => r.json())
          .catch(() => null);
        const currentPrice = quote?.price ?? null;
        const value = currentPrice != null ? currentPrice * h.shares : null;
        const cost = h.buyPrice * h.shares;
        const pnl = value != null ? value - cost : null;
        const pnlPct = pnl != null ? (pnl / cost) * 100 : null;
        return { ...h, currentPrice, name: quote?.name ?? h.ticker, value, cost, pnl, pnlPct };
      })
    );
    setHoldings(enriched);
    setLoading(false);
  }

  useEffect(() => {
    if (status === "authenticated") loadHoldings();
    else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  async function addHolding(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ticker: "", shares: "", buyPrice: "" });
    setShowForm(false);
    setAdding(false);
    setLoading(true);
    loadHoldings();
  }

  async function removeHolding(id: string) {
    await fetch("/api/portfolio", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }

  if (status === "unauthenticated") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Your Portfolio</h1>
        <p className="text-gray-500 mb-6">Sign in to track your holdings and P&L.</p>
        <Link href="/login" className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Sign In
        </Link>
      </main>
    );
  }

  const totalValue = holdings.reduce((s, h) => s + (h.value ?? 0), 0);
  const totalCost = holdings.reduce((s, h) => s + h.cost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const pieData = holdings
    .filter((h) => h.value != null && h.value > 0)
    .map((h) => ({ name: h.ticker, value: h.value! }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Holding
        </button>
      </div>

      {showForm && (
        <form onSubmit={addHolding} className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-wrap gap-3">
            <input
              required
              placeholder="Ticker (e.g. AAPL)"
              value={form.ticker}
              onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white w-32"
            />
            <input
              required type="number" min="0.001" step="any"
              placeholder="Shares"
              value={form.shares}
              onChange={(e) => setForm({ ...form, shares: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white w-28"
            />
            <input
              required type="number" min="0.01" step="any"
              placeholder="Buy price ($)"
              value={form.buyPrice}
              onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white w-36"
            />
            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : holdings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <p className="text-gray-500">No holdings yet.</p>
          <p className="mt-1 text-sm text-gray-400">Add a holding to start tracking your P&L.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Holdings table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-500">Total Value</p>
                <p className="text-lg font-bold dark:text-white">{formatLargeNumber(totalValue)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-500">Total Cost</p>
                <p className="text-lg font-bold dark:text-white">{formatLargeNumber(totalCost)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-500">Total P&L</p>
                <p className={`text-lg font-bold ${isPositive(totalPnl) ? "text-green-600" : "text-red-500"}`}>
                  {totalPnl >= 0 ? "+" : ""}{formatLargeNumber(totalPnl)} ({totalPnlPct.toFixed(2)}%)
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                    <th className="px-4 py-3 text-left font-medium">Stock</th>
                    <th className="px-4 py-3 text-right font-medium">Shares</th>
                    <th className="px-4 py-3 text-right font-medium">Avg Cost</th>
                    <th className="px-4 py-3 text-right font-medium">Current</th>
                    <th className="px-4 py-3 text-right font-medium">P&L</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {holdings.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <Link href={`/stock/${h.ticker}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600">
                          {h.ticker}
                        </Link>
                        <p className="text-xs text-gray-400 truncate max-w-[120px]">{h.name}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{h.shares}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatPrice(h.buyPrice)}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatPrice(h.currentPrice)}</td>
                      <td className="px-4 py-3 text-right">
                        {h.pnl != null ? (
                          <span className={h.pnl >= 0 ? "text-green-600" : "text-red-500"}>
                            {h.pnl >= 0 ? "+" : ""}{formatPrice(h.pnl)}
                            <br />
                            <span className="text-xs">({h.pnlPct?.toFixed(2)}%)</span>
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => removeHolding(h.id)} className="text-gray-300 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Allocation pie */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Allocation</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatLargeNumber(v as number)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1.5">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
                      </span>
                      <span className="text-gray-500">{((d.value / totalValue) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No data</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
