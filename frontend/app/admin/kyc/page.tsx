'use client';
import { useState, useEffect } from 'react';
import { getApiUrl } from '../../../utils/urlValidator';

export default function AdminKYC() {
  const [verifications, setVerifications] = useState<any[]>([]);

  useEffect(() => {
    fetch(getApiUrl('/kyc/admin/pending'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setVerifications(data.verifications || []));
  }, []);

  const handleApprove = async (id: string) => {
    await fetch(getApiUrl(`/kyc/admin/approve/${id}`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setVerifications(verifications.filter(v => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">KYC Approvals</h1>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Tier</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-4">{v.user_email}</td>
                <td className="p-4">{v.tier}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {v.status}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleApprove(v.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
