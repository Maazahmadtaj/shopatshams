'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', province: 'Punjab', notes: '',
  })

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0
  const total = subtotal + shipping

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/collections/all" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors inline-block">Shop Now</Link>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.email || !form.phone || !form.address || !form.city) {
      setError('Please fill in all required fields.'); return
    }
    setLoading(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({ productId: i.productId, title: i.title, price: i.price, quantity: i.quantity, imageUrl: i.imageUrl })),
        email: form.email, phone: form.phone,
        shippingAddress: { name: `${form.firstName} ${form.lastName}`, address: form.address, city: form.city, province: form.province, country: 'Pakistan' },
        notes: form.notes || null, subtotal, shipping, total, paymentMethod: 'cod',
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Order failed. Please try again.'); return }
    clearCart()
    router.push(`/order-confirmation?order=${data.orderNumber}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} required placeholder="Ali"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Khan"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="ali@example.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                <input type="tel" value={form.phone} onChange={set('phone')} required placeholder="+92 300 1234567"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address <span className="text-red-500">*</span></label>
                <input type="text" value={form.address} onChange={set('address')} required placeholder="House #, Street, Area"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input type="text" value={form.city} onChange={set('city')} required placeholder="Islamabad"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Province</label>
                  <select value={form.province} onChange={set('province')}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
                    {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'AJK', 'Gilgit-Baltistan', 'ICT'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order Notes (optional)</label>
                <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Special instructions..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Payment Method</h2>
            <label className="flex items-center gap-3 p-4 border-2 border-green-600 bg-green-50 rounded-xl cursor-pointer">
              <input type="radio" name="payment" value="cod" defaultChecked className="accent-green-700" />
              <div>
                <div className="font-semibold text-gray-900 text-sm">Cash on Delivery (COD)</div>
                <div className="text-xs text-gray-500">Pay when your order arrives</div>
              </div>
              <span className="ml-auto text-2xl">💵</span>
            </label>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto scrollbar-hide">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                  <span className="flex-1 text-gray-700 truncate">{item.title}</span>
                  <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-5 bg-green-700 text-white font-bold py-4 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-60 text-base active:scale-95">
              {loading ? 'Placing Order...' : `Place Order – ${formatPrice(total)}`}
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">🔒 Secure checkout · Cash on Delivery</p>
          </div>
        </div>
      </form>
    </div>
  )
}
