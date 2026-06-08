import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalCustomers, orders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'customer' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { items: true } }),
  ])

  const revenue = await prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } })
  const totalRevenue = revenue._sum.total ?? 0

  const pending = await prisma.order.count({ where: { status: 'pending' } })
  const lowStock = await prisma.product.count({ where: { available: false } })

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: '💰', color: 'bg-green-50 text-green-700', change: 'All time' },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: '🛍️', color: 'bg-blue-50 text-blue-700', change: `${pending} pending` },
    { label: 'Total Products', value: totalProducts.toLocaleString(), icon: '📦', color: 'bg-purple-50 text-purple-700', change: `${lowStock} out of stock` },
    { label: 'Customers', value: totalCustomers.toLocaleString(), icon: '👥', color: 'bg-amber-50 text-amber-700', change: 'Registered users' },
  ]

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back to Shams Admin</p>
        </div>
        <Link href="/admin/products/new" className="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm">
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className={`${stat.color} text-2xl w-12 h-12 rounded-xl flex items-center justify-center`}>{stat.icon}</span>
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-green-700 font-semibold hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            {orders.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-semibold text-green-700 hover:underline">
                          #{order.orderNumber}
                        </Link>
                        <div className="text-xs text-gray-400">{order.items.length} items</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{order.email}</div>
                        <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/products/new', label: 'Add New Product', icon: '➕' },
                { href: '/admin/orders?status=pending', label: 'View Pending Orders', icon: '⏳', badge: pending > 0 ? pending : undefined },
                { href: '/admin/products?available=false', label: 'Out of Stock Items', icon: '⚠️', badge: lowStock > 0 ? lowStock : undefined },
                { href: '/admin/customers', label: 'All Customers', icon: '👥' },
              ].map(a => (
                <Link key={a.href} href={a.href} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 group-hover:text-green-700">
                    <span>{a.icon}</span> {a.label}
                  </div>
                  {a.badge !== undefined && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{a.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-green-700 text-white rounded-xl p-5">
            <h3 className="font-bold mb-2">Import Products</h3>
            <p className="text-green-100 text-xs mb-3">Run the scraper to import all products from the live Shopify store.</p>
            <code className="block bg-green-800 rounded-lg px-3 py-2 text-xs font-mono text-green-100">
              npm run scrape
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
