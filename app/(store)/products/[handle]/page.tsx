'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, parseJSON } from '@/lib/utils'

interface Product {
  id: string; handle: string; title: string; vendor: string; price: number
  compareAtPrice: number | null; available: boolean; description: string
  images: string; variants: string; options: string; tags: string; sku: string | null
}

interface Variant { id: string; title: string; price: number; available: boolean; sku: string }

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${handle}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [handle])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="animate-pulse grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-4"><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-12 bg-gray-200 rounded" /></div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-xl font-bold mb-2">Product not found</h2>
      <Link href="/collections/all" className="text-green-700 font-semibold hover:underline">Back to all products</Link>
    </div>
  )

  const images = parseJSON<{ src: string }[]>(product.images, [])
  const tags = parseJSON<string[]>(product.tags, [])
  const maxQtyTag = tags.find(t => t.startsWith('qty:'))
  const maxQty = maxQtyTag ? parseInt(maxQtyTag.split(':')[2] ?? '99') : 99
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null

  const handleAdd = () => {
    if (!product.available) return
    addItem({ productId: product.id, handle: product.handle, title: product.title, price: product.price, imageUrl: images[0]?.src ?? '', quantity: qty, maxQty })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>/</span>
        <Link href="/collections/all" className="hover:text-green-700">Products</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 mb-3">
            {images[imgIdx] ? (
              <Image src={images[imgIdx].src} alt={product.title} fill className="object-contain p-6" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
            )}
            {!product.available && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="bg-gray-800 text-white font-bold px-6 py-2 rounded-full">Sold Out</span>
              </div>
            )}
            {discount && product.available && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${imgIdx === i ? 'border-green-600' : 'border-gray-200'}`}>
                  <Image src={img.src} alt="" width={64} height={64} className="object-contain w-full h-full p-1" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.vendor}</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">{product.title}</h1>

          {product.sku && <p className="text-xs text-gray-400 mb-4">SKU: {product.sku}</p>}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
            {discount && <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">Save {discount}%</span>}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${product.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <span className={`w-2 h-2 rounded-full ${product.available ? 'bg-green-500' : 'bg-red-400'}`} />
              {product.available ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {product.available && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors">-</button>
                <span className="w-12 text-center font-semibold text-gray-900">{qty}</span>
                <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors">+</button>
              </div>
              {maxQty < 10 && <span className="text-xs text-amber-600 font-medium">Max {maxQty} per order</span>}
            </div>
          )}

          <button onClick={handleAdd} disabled={!product.available}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all ${added ? 'bg-green-800 text-white scale-95' : product.available ? 'bg-green-700 text-white hover:bg-green-800 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {added ? '✓ Added to Cart!' : !product.available ? 'Out of Stock' : `Add to Cart – ${formatPrice(product.price * qty)}`}
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <span>🚚</span> <span>Free delivery on Rs. 5,000+</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <span>💳</span> <span>Cash on Delivery available</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <span>✅</span> <span>100% Authentic product</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <span>🔄</span> <span>7-day return policy</span>
            </div>
          </div>

          {product.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <div className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {tags.filter(t => !t.startsWith('qty:')).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.filter(t => !t.startsWith('qty:')).map(tag => (
                <Link key={tag} href={`/collections/all?q=${tag}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md hover:bg-green-50 hover:text-green-700 transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
