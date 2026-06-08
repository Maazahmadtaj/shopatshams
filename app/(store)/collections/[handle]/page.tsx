import { prisma } from '@/lib/db'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 24

interface Props {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ page?: string; sort?: string; min?: string; max?: string; q?: string; instock?: string; vendor?: string }>
}

async function getProducts(handle: string, params: Awaited<Props['searchParams']>) {
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const min = params.min ? parseFloat(params.min) : undefined
  const max = params.max ? parseFloat(params.max) : undefined
  const instock = params.instock === '1'
  const vendor = params.vendor
  const q = params.q?.trim()

  const orderBy =
    params.sort === 'price-asc' ? { price: 'asc' as const } :
    params.sort === 'price-desc' ? { price: 'desc' as const } :
    params.sort === 'title-asc' ? { title: 'asc' as const } :
    { createdAt: 'desc' as const }

  const where: any = {
    ...(instock && { available: true }),
    ...(min !== undefined && { price: { gte: min, ...(max !== undefined && { lte: max }) } }),
    ...(max !== undefined && min === undefined && { price: { lte: max } }),
    ...(vendor && { vendor }),
    ...(q && { title: { contains: q } }),
  }

  if (handle !== 'all') {
    const collection = await prisma.collection.findUnique({
      where: { handle },
      include: { products: { select: { productId: true } } },
    })
    if (!collection) return null
    const ids = collection.products.map(p => p.productId)
    where.id = { in: ids }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, handle: true, title: true, vendor: true, price: true, compareAtPrice: true, available: true, images: true, tags: true },
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, page, pages: Math.ceil(total / PAGE_SIZE) }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params
  const sp = await searchParams
  const result = await getProducts(handle, sp)

  if (result === null) notFound()

  const { products, total, page, pages } = result
  const title = handle === 'all' ? 'All Products' : handle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const vendors = await prisma.product.groupBy({ by: ['vendor'], _count: true, orderBy: { _count: { vendor: 'desc' } }, take: 30 })

  const buildUrl = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const merged = { page: '1', sort: sp.sort, min: sp.min, max: sp.max, q: sp.q, instock: sp.instock, vendor: sp.vendor, ...extra }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    return `/collections/${handle}?${p.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium capitalize">{title}</span>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Availability</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-green-700 rounded"
                  defaultChecked={sp.instock === '1'}
                  onChange={e => { window.location.href = buildUrl({ instock: e.target.checked ? '1' : undefined }) }}
                />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Price Range</h3>
              <form action={`/collections/${handle}`} method="GET" className="space-y-2">
                {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
                {sp.instock && <input type="hidden" name="instock" value={sp.instock} />}
                {sp.q && <input type="hidden" name="q" value={sp.q} />}
                <div className="flex gap-2">
                  <input type="number" name="min" placeholder="Min" defaultValue={sp.min} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-600" />
                  <input type="number" name="max" placeholder="Max" defaultValue={sp.max} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-600" />
                </div>
                <button type="submit" className="w-full bg-green-700 text-white text-xs font-semibold py-1.5 rounded hover:bg-green-800 transition-colors">Apply</button>
              </form>
            </div>

            {vendors.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Brand</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
                  {vendors.map(v => (
                    <Link key={v.vendor} href={buildUrl({ vendor: sp.vendor === v.vendor ? undefined : v.vendor })}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${sp.vendor === v.vendor ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <span className="truncate">{v.vendor}</span>
                      <span className="text-xs text-gray-400 ml-1">({v._count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(sp.sort || sp.min || sp.max || sp.instock || sp.vendor) && (
              <Link href={`/collections/${handle}`} className="block text-center text-xs text-red-600 hover:underline">
                Clear all filters
              </Link>
            )}
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900 capitalize">{title}</h1>
              <p className="text-sm text-gray-500">{total.toLocaleString()} products</p>
            </div>
            <div className="flex items-center gap-2">
              {sp.q && (
                <span className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
                  Search: "{sp.q}" <Link href={buildUrl({ q: undefined })} className="ml-1 text-green-500 hover:text-red-500">×</Link>
                </span>
              )}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                defaultValue={sp.sort ?? 'newest'}
                onChange={e => { window.location.href = buildUrl({ sort: e.target.value === 'newest' ? undefined : e.target.value }) }}
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:border-green-600 hover:text-green-700 transition-colors">← Prev</Link>}
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = pages <= 7 ? i + 1 : i < 3 ? i + 1 : i >= 4 ? pages - (6 - i) : page
                    return (
                      <Link key={p} href={buildUrl({ page: String(p) })}
                        className={`w-9 h-9 flex items-center justify-center border rounded-lg text-sm transition-colors ${page === p ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 hover:border-green-600 hover:text-green-700'}`}>
                        {p}
                      </Link>
                    )
                  })}
                  {page < pages && <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:border-green-600 hover:text-green-700 transition-colors">Next →</Link>}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search query.</p>
              <Link href={`/collections/${handle}`} className="text-green-700 font-semibold hover:underline text-sm">Clear filters</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
