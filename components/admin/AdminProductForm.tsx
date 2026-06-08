'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { parseJSON } from '@/lib/utils'

interface Product {
  id: string; title: string; handle: string; vendor: string; price: number
  compareAtPrice: number | null; sku: string | null; available: boolean
  description: string; images: string; tags: string
}

export default function AdminProductForm({ product }: { product: Product | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: product?.title ?? '',
    handle: product?.handle ?? '',
    vendor: product?.vendor ?? '',
    price: product?.price?.toString() ?? '',
    compareAtPrice: product?.compareAtPrice?.toString() ?? '',
    sku: product?.sku ?? '',
    available: product?.available ?? true,
    description: product?.description ?? '',
    tags: parseJSON<string[]>(product?.tags ?? '[]', []).join(', '),
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.price) { setError('Title and price are required.'); return }
    setLoading(true)
    const body = {
      ...form,
      price: parseFloat(form.price),
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
      tags: JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)),
    }
    const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
    const method = product ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Failed to save product.'); return }
    router.push('/admin/products')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!product || !confirm('Delete this product permanently?')) return
    setLoading(true)
    await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      {/* Left: Main details */}
      <div className="lg:col-span-2 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Product Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={set('title')} required placeholder="Product name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Handle</label>
              <input type="text" value={form.handle} onChange={set('handle')} placeholder="auto-generated-from-title"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={set('description')} rows={5} placeholder="Product description..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-y" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (Rs.) <span className="text-red-500">*</span></label>
              <input type="number" value={form.price} onChange={set('price')} required min="0" step="0.01" placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Compare at Price (Rs.)</label>
              <input type="number" value={form.compareAtPrice} onChange={set('compareAtPrice')} min="0" step="0.01" placeholder="Original price"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Meta */}
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Status & Details</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.available} onChange={set('available')} className="w-4 h-4 accent-green-700" />
                <span className="text-sm font-semibold text-gray-700">Available / In Stock</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vendor / Brand</label>
              <input type="text" value={form.vendor} onChange={set('vendor')} placeholder="Brand name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU / Barcode</label>
              <input type="text" value={form.sku} onChange={set('sku')} placeholder="8901234567890"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={set('tags')} placeholder="beverages, imported, cold-drinks"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button type="submit" disabled={loading}
            className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-60">
            {loading ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="w-full border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          {product && (
            <button type="button" onClick={handleDelete}
              className="w-full border border-red-200 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors">
              Delete Product
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
