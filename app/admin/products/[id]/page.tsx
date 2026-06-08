import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import AdminProductForm from '@/components/admin/AdminProductForm'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = id === 'new' ? null : await prisma.product.findUnique({ where: { id } })
  if (id !== 'new' && !product) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">{product ? 'Edit Product' : 'New Product'}</h1>
      </div>
      <AdminProductForm product={product} />
    </div>
  )
}
