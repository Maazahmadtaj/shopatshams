'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/orders', label: 'Orders', icon: '🛍️' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/collections', label: 'Collections', icon: '🗂️' },
]

interface Props { user: { name?: string; email?: string; role?: string } }

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-gray-900 text-white flex flex-col flex-shrink-0 transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">S</div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-white truncate">Shams Admin</div>
            <div className="text-xs text-gray-400 truncate">Shopping Centre</div>
          </div>
        )}
        <button onClick={() => setCollapsed(c => !c)} className="text-gray-400 hover:text-white ml-auto flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href, item.exact)
                ? 'bg-green-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Store link */}
      <div className="px-2 pb-2">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <span className="text-base flex-shrink-0">🌐</span>
          {!collapsed && <span>View Store</span>}
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-gray-800 px-3 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.name ?? 'Admin'}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-500 hover:text-red-400 transition-colors" title="Sign out">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex justify-center text-gray-500 hover:text-red-400 transition-colors" title="Sign out">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  )
}
