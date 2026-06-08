import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface Props {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>
}

export default async function AdminOrders({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  const where: any = {
    ...(sp.status && { status: sp.status }),
    ...(sp.q && { OR: [{ orderNumber: { contains: sp.q } }, { email: { contains: sp.q } }] }),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { items: true } }),
    prisma.order.count({ where }),
  ])
  const pages = Math.ceil(total / PAGE_SIZE)

  const buildUrl = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const merged = { page: '1', status: sp.status, q: sp.q, ...extra }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    return `/admin/orders?${p.toString()}`
  }

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{total.toLocaleString()} total orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form action="/admin/orders" method="GET" className="flex-1 min-w-48 flex gap-2">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <input type="text" name="q" defaultValue={sp.q} placeholder="Search order number or email..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors">Search</button>
        </form>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Link href={buildUrl({ status: undefined })} className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${!sp.status ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 text-gray-600 hover:border-green-600'}`}>All</Link>
          {statuses.map(s => (
            <Link key={s} href={buildUrl({ status: s })} className={`px-3 py-1.5 rounded-lg border font-medium capitalize transition-colors ${sp.status === s ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 text-gray-600 hover:border-green-600'}`}>{s}</Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-green-700">#{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{o.email}</div>
                    {o.phone && <div className="text-xs text-gray-400">{o.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.items.length} items</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs font-semibold text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400"><p className="text-3xl mb-2">📋</p><p className="text-sm">No orders found</p></div>
          )}
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={buildUrl({ page: String(page - 1) })} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:border-green-600 transition-colors">← Prev</Link>}
              {page < pages && <Link href={buildUrl({ page: String(page + 1) })} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:border-green-600 transition-colors">Next →</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
