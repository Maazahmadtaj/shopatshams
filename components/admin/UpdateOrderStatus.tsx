'use client'
import { useState } from 'react'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function UpdateOrderStatus({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await fetch(`/api/admin/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <select value={status} onChange={e => setStatus(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 capitalize">
        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
      </select>
      <button onClick={handleSave} disabled={loading || status === currentStatus}
        className="w-full bg-green-700 text-white font-semibold py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 text-sm">
        {saved ? '✓ Saved!' : loading ? 'Saving...' : 'Update Status'}
      </button>
    </div>
  )
}
