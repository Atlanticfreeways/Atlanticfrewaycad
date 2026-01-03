export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-4">Atlanticfrewaycard</h1>
        <p className="text-center text-gray-600 mb-8">
          Unified card platform for business and personal use
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/business/dashboard" className="card hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">Business Dashboard</h2>
            <p className="text-gray-600">Manage companies, employees, and expenses</p>
          </a>
          <a href="/personal/dashboard" className="card hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">Personal Dashboard</h2>
            <p className="text-gray-600">Manage your cards and wallet</p>
          </a>
          <a href="/admin/dashboard" className="card hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Platform administration and analytics</p>
          </a>
        </div>
      </div>
    </main>
  );
}
