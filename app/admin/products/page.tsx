import { prisma } from '@/lib/db'
import { formatPrice, parseJSON } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

interface Props {
  searchParams: Promise<{ page?: string; q?: string; available?: string }>
}

export default async function AdminProducts({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const q = sp.q?.trim()
  const availFilter = sp.available

  const where: any = {
    ...(q && { OR: [{ title: { contains: q } }, { vendor: { contains: q } }, { sku: { contains: q } }] }),
    ...(availFilter === 'true' && { available: true }),
    ...(availFilter === 'false' && { available: false }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
  ])
  const pages = Math.ceil(total / PAGE_SIZE)

  const buildUrl = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const merged = { page: '1', q: sp.q, available: sp.available, ...extra }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    return `/admin/products?${p.toString()}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{total.toLocaleString()} total products</p>
        </div>
        <Link href="/admin/products/new" className="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm">
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form action="/admin/products" method="GET" className="flex-1 min-w-48 flex gap-2">
          {sp.available && <input type="hidden" name="available" value={sp.available} />}
          <input type="text" name="q" defaultValue={sp.q} placeholder="Search products, vendors, SKUs..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors">Search</button>
        </form>
        <div className="flex gap-2 text-sm">
          <Link href={buildUrl({ available: undefined })} className={`px-3 py-2 rounded-lg border font-medium transition-colors ${!availFilter ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 text-gray-600 hover:border-green-600'}`}>All</Link>
          <Link href={buildUrl({ available: 'true' })} className={`px-3 py-2 rounded-lg border font-medium transition-colors ${availFilter === 'true' ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 text-gray-600 hover:border-green-600'}`}>In Stock</Link>
          <Link href={buildUrl({ available: 'false' })} className={`px-3 py-2 rounded-lg border font-medium transition-colors ${availFilter === 'false' ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600 hover:border-red-400'}`}>Out of Stock</Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => {
                const imgs = parseJSON<{ src: string }[]>(p.images, [])
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                          {imgs[0] ? (
                            <Image src={imgs[0].src} alt={p.title} width={40} height={40} className="w-full h-full object-contain p-0.5" unoptimized />
                          ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 line-clamp-1 max-w-xs">{p.title}</div>
                          <div className="text-xs text-gray-400">{p.sku ?? 'No SKU'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.vendor || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.available ? 'bg-green-500' : 'bg-red-400'}`} />
                        {p.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${p.handle}`} target="_blank" className="text-xs text-gray-400 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors">View</Link>
                        <Link href={`/admin/products/${p.id}`} className="text-xs font-semibold text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors">Edit</Link>
                        <DeleteProductButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm">No products found</p>
              {(q || availFilter) && <Link href="/admin/products" className="text-xs text-green-700 hover:underline mt-1 block">Clear filters</Link>}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={buildUrl({ page: String(page - 1) })} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:border-green-600 hover:text-green-700 transition-colors">← Prev</Link>}
              {page < pages && <Link href={buildUrl({ page: String(page + 1) })} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:border-green-600 hover:text-green-700 transition-colors">Next →</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DeleteProductButton({ id }: { id: string }) {
  return (
    <form action={`/api/admin/products/${id}`} method="POST">
      <input type="hidden" name="_method" value="DELETE" />
      <button
        type="button"
        onClick={async () => {
          if (!confirm('Delete this product?')) return
          await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
          window.location.reload()
        }}
        className="text-xs text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
      >
        Delete
      </button>
    </form>
  )
}
