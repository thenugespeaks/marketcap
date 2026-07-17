import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const holdings = await prisma.portfolioHolding.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(holdings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { ticker, shares, buyPrice } = await req.json();
  if (!ticker || !shares || !buyPrice) {
    return Response.json({ error: "ticker, shares, buyPrice required" }, { status: 400 });
  }

  const holding = await prisma.portfolioHolding.create({
    data: {
      ticker: ticker.toUpperCase(),
      shares: parseFloat(shares),
      buyPrice: parseFloat(buyPrice),
      userId: session.user.id,
    },
  });

  return Response.json(holding, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.portfolioHolding.deleteMany({
    where: { id, userId: session.user.id },
  });

  return Response.json({ ok: true });
}
