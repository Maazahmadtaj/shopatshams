import Link from 'next/link'

interface Props { searchParams: Promise<{ order?: string }> }

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { order } = await searchParams

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-black text-gray-900 mb-3">Order Placed!</h1>
      {order && <p className="text-lg text-gray-600 mb-2">Order <span className="font-bold text-green-700">#{order}</span> confirmed</p>}
      <p className="text-gray-500 mb-8">
        Thank you for shopping at Shams Shopping Centre. Our team will contact you shortly to confirm your order. Payment is collected on delivery.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/collections/all" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors">
          Continue Shopping
        </Link>
        <Link href="/account" className="border-2 border-green-700 text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors">
          Track Orders
        </Link>
      </div>
    </div>
  )
}
