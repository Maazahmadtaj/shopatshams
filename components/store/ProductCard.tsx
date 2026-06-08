'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, parseJSON } from '@/lib/utils'

interface Props {
  product: {
    id: string
    handle: string
    title: string
    vendor: string
    price: number
    compareAtPrice: number | null
    available: boolean
    images: string
    tags: string
  }
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const images = parseJSON<{ src: string }[]>(product.images, [])
  const imageUrl = images[0]?.src ?? '/placeholder.png'
  const tags = parseJSON<string[]>(product.tags, [])
  const maxQtyTag = tags.find(t => t.startsWith('qty:'))
  const maxQty = maxQtyTag ? parseInt(maxQtyTag.split(':')[2] ?? '99') : 99
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!product.available) return
    addItem({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      price: product.price,
      imageUrl,
      quantity: 1,
      maxQty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/products/${product.handle}`} className="group block bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
          unoptimized
        />
        {!product.available && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full">Sold Out</span>
          </div>
        )}
        {discount && product.available && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.vendor}</p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-green-700 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-bold text-gray-900 text-sm">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.available}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              added
                ? 'bg-green-700 text-white scale-110'
                : product.available
                ? 'bg-green-50 text-green-700 hover:bg-green-700 hover:text-white border border-green-200'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Add to cart"
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  )
}
