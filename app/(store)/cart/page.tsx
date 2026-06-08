'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'

export default function CartPage() {
  const { items, count, subtotal, removeItem, updateQty, clearCart } = useCart()
  const [note, setNote] = useState('')
  const router = useRouter()

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0
  const total = subtotal + shipping

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/collections/all" className="bg-green-700 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-800 transition-colors inline-block">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Shopping Cart ({count} {count === 1 ? 'item' : 'items'})</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear cart</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
              <Link href={`/products/${item.handle}`} className="flex-shrink-0">
                <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-1" unoptimized />
                  ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.handle}`} className="font-semibold text-gray-900 text-sm hover:text-green-700 line-clamp-2">
                  {item.title}
                </Link>
                <p className="text-sm text-green-700 font-bold mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold transition-colors">-</button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold transition-colors">+</button>
                </div>
                <p className="w-24 text-right font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          ))}

          {/* Order note */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Add Order Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Special instructions, gift message, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
            />
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-semibold">FREE 🎉</span>
                ) : (
                  <span className="font-medium text-gray-900">{formatPrice(shipping)}</span>
                )}
              </div>
              {shipping > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!
                </p>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-base text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-green-700 text-white font-bold py-3.5 rounded-xl hover:bg-green-800 transition-colors active:scale-95"
            >
              Proceed to Checkout →
            </button>

            <div className="mt-3 space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-2"><span>✅</span><span>Secure checkout</span></div>
              <div className="flex items-center gap-2"><span>💳</span><span>Cash on delivery</span></div>
              <div className="flex items-center gap-2"><span>🔄</span><span>7-day returns</span></div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Link href="/collections/all" className="block text-center text-sm text-green-700 font-semibold hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
