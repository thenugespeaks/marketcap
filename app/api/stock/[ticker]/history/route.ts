import { getHistory } from "@/lib/yahoo";

export const revalidate = 300;

function periodToDate(range: string): { date: Date; interval: "1d" | "1wk" | "1mo" } {
  const now = new Date();
  switch (range) {
    case "1D":
      return { date: new Date(now.getTime() - 2 * 86400000), interval: "1d" };
    case "5D":
      return { date: new Date(now.getTime() - 5 * 86400000), interval: "1d" };
    case "1M":
      return { date: new Date(now.getTime() - 30 * 86400000), interval: "1d" };
    case "6M":
      return { date: new Date(now.getTime() - 180 * 86400000), interval: "1d" };
    case "1Y":
      return { date: new Date(now.getTime() - 365 * 86400000), interval: "1wk" };
    case "5Y":
      return { date: new Date(now.getTime() - 5 * 365 * 86400000), interval: "1mo" };
    default:
      return { date: new Date(now.getTime() - 30 * 86400000), interval: "1d" };
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker);
  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "1M";
  const { date, interval } = periodToDate(range);

  const history = await getHistory(ticker.toUpperCase(), date, interval);

  const data = history.map((h) => ({
    date: h.date.toISOString(),
    open: h.open,
    high: h.high,
    low: h.low,
    close: h.close,
    volume: h.volume,
  }));

  return Response.json(data);
}
