import AdminProductForm from '@/components/admin/AdminProductForm'

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Add New Product</h1>
      </div>
      <AdminProductForm product={null} />
    </div>
  )
}
