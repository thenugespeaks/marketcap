import { getMarketNews } from "@/lib/finnhub";

export const revalidate = 300;

export async function GET() {
  const news = await getMarketNews();
  return Response.json(news);
}
