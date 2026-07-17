import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: "desc" },
  });

  return Response.json(items.map((i) => i.ticker));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { ticker } = await req.json();
  if (!ticker) return Response.json({ error: "Ticker required" }, { status: 400 });

  await prisma.watchlistItem.upsert({
    where: { userId_ticker: { userId: session.user.id, ticker: ticker.toUpperCase() } },
    create: { userId: session.user.id, ticker: ticker.toUpperCase() },
    update: {},
  });

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { ticker } = await req.json();
  await prisma.watchlistItem.deleteMany({
    where: { userId: session.user.id, ticker: ticker.toUpperCase() },
  });

  return Response.json({ ok: true });
}
