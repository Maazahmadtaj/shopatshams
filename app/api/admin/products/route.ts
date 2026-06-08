import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') return null
  return session
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, handle, vendor, price, compareAtPrice, sku, available, description, tags } = body
  if (!title || price === undefined) return NextResponse.json({ error: 'Title and price required.' }, { status: 400 })

  const product = await prisma.product.create({
    data: {
      title, handle: handle || slugify(title),
      vendor: vendor ?? '', price, compareAtPrice: compareAtPrice ?? null,
      sku: sku ?? null, available: available ?? true,
      description: description ?? '', tags: tags ?? '[]',
    },
  })
  return NextResponse.json(product, { status: 201 })
}
