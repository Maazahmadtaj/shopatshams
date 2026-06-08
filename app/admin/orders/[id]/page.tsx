import { prisma } from '@/lib/db'
import { formatPrice, parseJSON } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'
import UpdateOrderStatus from '@/components/admin/UpdateOrderStatus'

interface Props { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } })
  if (!order) notFound()

  const address = parseJSON<Record<string, string>>(order.shippingAddress, {})

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800', shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 transition-colors">← Orders</Link>
        <h1 className="text-2xl font-black text-gray-900">Order #{order.orderNumber}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100'}`}>{order.status}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900">Order Items</div>
            <div className="divide-y divide-gray-100">
              {order.items.map(item => {
                const imgs = parseJSON<{ src: string }[]>(item.product?.images ?? '[]', [])
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      {imgs[0] ? <Image src={imgs[0].src} alt={item.title} width={48} height={48} className="w-full h-full object-contain p-0.5" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{item.title}</div>
                      <div className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                )
              })}
            </div>
            <div className="px-5 py-4 bg-gray-50 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-200 pt-2 mt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-amber-800 mb-1 text-sm">Customer Note</h3>
              <p className="text-amber-700 text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Update status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Update Status</h2>
            <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Customer info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Customer</h2>
            <div className="space-y-1.5 text-sm">
              <div className="text-gray-700 font-medium">{order.email}</div>
              {order.phone && <div className="text-gray-500">{order.phone}</div>}
            </div>
          </div>

          {/* Shipping address */}
          {Object.keys(address).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Shipping Address</h2>
              <div className="text-sm text-gray-600 space-y-0.5">
                {address.name && <div className="font-semibold text-gray-800">{address.name}</div>}
                {address.address && <div>{address.address}</div>}
                {address.city && <div>{address.city}{address.province ? `, ${address.province}` : ''}</div>}
                {address.country && <div>{address.country}</div>}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-2">Order Info</h2>
            <div className="text-sm text-gray-500 space-y-1">
              <div>Placed: {new Date(order.createdAt).toLocaleString()}</div>
              <div>Payment: {order.paymentMethod?.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
