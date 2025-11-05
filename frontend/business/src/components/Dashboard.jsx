import { useAuthStore } from '../hooks/useAuth';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import Employees from './Employees';
import Cards from './Cards';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Atlanticfrewaycard Business</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4 space-y-2">
            <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100">Dashboard</Link>
            <Link to="/dashboard/employees" className="block px-4 py-2 rounded hover:bg-gray-100">Employees</Link>
            <Link to="/dashboard/cards" className="block px-4 py-2 rounded hover:bg-gray-100">Cards</Link>
            <Link to="/dashboard/transactions" className="block px-4 py-2 rounded hover:bg-gray-100">Transactions</Link>
          </nav>
        </aside>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Employees</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Active Cards</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Monthly Spend</h3>
                    <p className="text-3xl font-bold mt-2">$0</p>
                  </div>
                </div>
              </div>
            } />
            <Route path="/employees" element={<Employees />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/transactions" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Transactions</h1>
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}
