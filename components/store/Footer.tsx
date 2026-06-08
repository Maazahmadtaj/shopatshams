import Link from 'next/link'

const links = {
  Shop: [
    { label: 'All Products', href: '/collections/all' },
    { label: 'Beverages', href: '/collections/beverages' },
    { label: 'Beauty', href: '/collections/beauty' },
    { label: 'Perfumes', href: '/collections/attar-collection' },
    { label: 'Food & Snacks', href: '/collections/biscuits' },
    { label: 'Gift Baskets', href: '/collections/basket-superbe-chocolatebox' },
  ],
  Account: [
    { label: 'Login', href: '/account/login' },
    { label: 'Register', href: '/account/register' },
    { label: 'My Orders', href: '/account/orders' },
    { label: 'My Account', href: '/account' },
  ],
  Help: [
    { label: 'Contact Us', href: '/pages/contact' },
    { label: 'Shipping Policy', href: '/pages/shipping' },
    { label: 'Return Policy', href: '/pages/returns' },
    { label: 'FAQ', href: '/pages/faq' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-lg">S</div>
              <div>
                <div className="font-black text-white text-base leading-tight">SHAMS</div>
                <div className="text-gray-400 text-xs leading-tight">Shopping Centre</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pakistan's premier destination for international brands. Quality products, delivered to your door.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://wa.me/923001234567" className="text-gray-400 hover:text-green-400 transition-colors" target="_blank" rel="noopener noreferrer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.103 1.518 5.83L0 24l6.335-1.518A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.003-1.366l-.36-.213-3.716.892.908-3.605-.235-.373A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/></svg>
              </a>
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Shams Shopping Centre. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>Nationwide Delivery</span>
            <span>•</span>
            <span>Authentic Products</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
