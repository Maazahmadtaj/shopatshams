import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items, email, phone, shippingAddress, notes, subtotal, shipping, total, paymentMethod } = body

  if (!items?.length || !email || !total) {
    return NextResponse.json({ error: 'Missing required order data.' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const userId = session ? (session.user as any).id : null

  const productIds = items.map((i: any) => i.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId,
      email,
      phone: phone ?? null,
      subtotal,
      shipping: shipping ?? 0,
      total,
      paymentMethod: paymentMethod ?? 'cod',
      shippingAddress: JSON.stringify(shippingAddress ?? {}),
      notes: notes ?? null,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl ?? null,
        })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 })
}
