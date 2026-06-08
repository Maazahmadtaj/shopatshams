'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/account/login')
  }, [status, router])

  if (status === 'loading') return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!session) return null

  const user = session.user as any

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-900 mb-8">My Account</h1>

      <div className="grid gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-700 rounded-full flex items-center justify-center text-white font-black text-xl">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user.name || 'Customer'}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/account/orders" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-600 hover:shadow-sm transition-all group">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-bold text-gray-900 group-hover:text-green-700">My Orders</h3>
            <p className="text-sm text-gray-500 mt-1">View your order history and track deliveries</p>
          </Link>

          <Link href="/collections/all" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-600 hover:shadow-sm transition-all group">
            <div className="text-2xl mb-2">🛍️</div>
            <h3 className="font-bold text-gray-900 group-hover:text-green-700">Continue Shopping</h3>
            <p className="text-sm text-gray-500 mt-1">Browse all products in our store</p>
          </Link>

          {user.role === 'admin' && (
            <Link href="/admin" className="bg-green-700 text-white rounded-2xl p-5 hover:bg-green-800 transition-all group">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-bold">Admin Panel</h3>
              <p className="text-sm text-green-200 mt-1">Manage products, orders, and customers</p>
            </Link>
          )}
        </div>

        {/* Sign Out */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">Account Actions</h3>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-red-600 font-semibold text-sm hover:underline"
          >
            Sign out of your account
          </button>
        </div>
      </div>
    </div>
  )
}
