import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ orders: [] })

  const orders = await prisma.order.findMany({
    where: { email: session.user!.email! },
    include: { items: { select: { id: true, title: true, price: true, quantity: true, imageUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ orders })
}
