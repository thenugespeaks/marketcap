import { searchTickers } from "@/lib/yahoo";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 1) return Response.json([]);

  const results = await searchTickers(q);
  return Response.json(
    results.map((r) => ({
      symbol: r.symbol,
      shortname: "shortname" in r ? r.shortname : r.symbol,
      exchange: "exchange" in r ? r.exchange : "",
      quoteType: r.quoteType,
    }))
  );
}
