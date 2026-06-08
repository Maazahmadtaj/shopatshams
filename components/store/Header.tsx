'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useSession, signOut } from 'next-auth/react'

const categories = [
  { label: 'Beverages', handle: 'beverages' },
  { label: 'Food & Snacks', handle: 'biscuits' },
  { label: 'Beauty', handle: 'beauty' },
  { label: 'Perfumes', handle: 'attar-collection' },
  { label: 'Cigars', handle: 'altitude' },
  { label: 'Baby', handle: 'baby' },
  { label: 'Personal Care', handle: 'personal-care' },
  { label: 'Gift Baskets', handle: 'basket-superbe-chocolatebox' },
]

export default function Header() {
  const { count } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/collections/all?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Announcement bar */}
      <div className="bg-green-700 text-white text-center text-xs py-2 px-4">
        🚚 Free delivery on orders above Rs. 5,000 &nbsp;|&nbsp; Cash on Delivery available
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center text-white font-black text-lg">S</div>
          <div className="hidden sm:block">
            <div className="font-black text-green-700 text-base leading-tight">SHAMS</div>
            <div className="text-gray-500 text-xs leading-tight">Shopping Centre</div>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-green-700 text-white rounded-r-full hover:bg-green-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          {/* Account */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs hidden sm:block">{session ? (session.user?.name?.split(' ')[0] ?? 'Account') : 'Login'}</span>
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                {session ? (
                  <>
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setAccountOpen(false)}>My Account</Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setAccountOpen(false)}>My Orders</Link>
                    {(session.user as any)?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-green-700 font-semibold hover:bg-gray-50" onClick={() => setAccountOpen(false)}>Admin Panel</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { signOut({ callbackUrl: '/' }); setAccountOpen(false) }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/account/login" className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50" onClick={() => setAccountOpen(false)}>Sign In</Link>
                    <Link href="/account/register" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setAccountOpen(false)}>Create Account</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-700 transition-colors">
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
            <span className="text-xs hidden sm:block">Cart</span>
          </Link>
        </div>
      </div>

      {/* Category nav - desktop */}
      <nav className="hidden lg:block border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1">
            <li>
              <Link href="/collections/all" className="flex items-center gap-1 px-3 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 rounded transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                All Products
              </Link>
            </li>
            {categories.map(cat => (
              <li key={cat.handle}>
                <Link href={`/collections/${cat.handle}`} className="block px-3 py-2.5 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 rounded transition-colors whitespace-nowrap">
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-2">
            <Link href="/collections/all" className="block py-2.5 text-sm font-semibold text-green-700 border-b border-gray-100" onClick={() => setMenuOpen(false)}>All Products</Link>
            {categories.map(cat => (
              <Link key={cat.handle} href={`/collections/${cat.handle}`} className="block py-2.5 text-sm text-gray-700 border-b border-gray-100" onClick={() => setMenuOpen(false)}>
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
