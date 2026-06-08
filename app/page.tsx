import Link from 'next/link'
import { prisma } from '@/lib/db'
import ProductCard from '@/components/store/ProductCard'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  { name: 'Beverages', handle: 'beverages', emoji: '🥤', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Food & Snacks', handle: 'biscuits', emoji: '🍫', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Beauty', handle: 'beauty', emoji: '💄', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Perfumes', handle: 'attar-collection', emoji: '🌸', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Personal Care', handle: 'personal-care', emoji: '🧴', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Baby', handle: 'baby', emoji: '🍼', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Cigars', handle: 'altitude', emoji: '🚬', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { name: 'Gift Baskets', handle: 'basket-superbe-chocolatebox', emoji: '🎁', color: 'bg-red-50 text-red-700 border-red-200' },
]

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { available: true },
    orderBy: { createdAt: 'desc' },
    take: 16,
    select: { id: true, handle: true, title: true, vendor: true, price: true, compareAtPrice: true, available: true, images: true, tags: true },
  })

  const totalProducts = await prisma.product.count()

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
                🇵🇰 Pakistan's Premier Import Store
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                International Brands,<br />
                <span className="text-yellow-300">Delivered to You</span>
              </h1>
              <p className="text-green-100 text-lg mb-8 leading-relaxed">
                Shop from {totalProducts.toLocaleString()}+ authentic international products — beverages, beauty, perfumes, food, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/collections/all" className="bg-white text-green-800 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 hover:text-green-900 transition-colors">
                  Shop Now →
                </Link>
                <Link href="/collections/beauty" className="bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30">
                  Browse Beauty
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {CATEGORIES.slice(0, 4).map(cat => (
                <Link key={cat.handle} href={`/collections/${cat.handle}`} className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/25 transition-all border border-white/20 group">
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <div className="font-semibold text-white text-sm">{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories grid */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.handle}
                href={`/collections/${cat.handle}`}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${cat.color} hover:scale-105 transition-transform text-center`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust badges */}
        <div className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚚', title: 'Free Delivery', desc: 'On orders Rs. 5,000+' },
              { icon: '✅', title: '100% Authentic', desc: 'Genuine imported products' },
              { icon: '💳', title: 'Cash on Delivery', desc: 'Pay when you receive' },
              { icon: '🔄', title: 'Easy Returns', desc: '7-day return policy' },
            ].map(b => (
              <div key={b.title} className="flex items-center gap-3">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{b.title}</div>
                  <div className="text-xs text-gray-500">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Latest Products</h2>
            <Link href="/collections/all" className="text-sm text-green-700 font-semibold hover:underline">
              View all {totalProducts.toLocaleString()} products →
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-600 font-medium">Products are being imported...</p>
              <p className="text-gray-400 text-sm mt-1">Run the scraper to populate the store</p>
            </div>
          )}
        </section>

        {/* CTA banner */}
        <section className="bg-amber-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-3">Can't find what you're looking for?</h2>
            <p className="text-amber-100 mb-6">We stock {totalProducts.toLocaleString()}+ products. Search our full catalog.</p>
            <Link href="/collections/all" className="bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-colors inline-block">
              Browse All Products
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
