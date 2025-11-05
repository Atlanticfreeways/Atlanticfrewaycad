import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessAPI } from '../services/api';

export default function Cards() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dailyLimit: 500,
    monthlyLimit: 5000,
    merchantRestrictions: []
  });
  const queryClient = useQueryClient();

  const issueCardMutation = useMutation({
    mutationFn: businessAPI.issueCard,
    onSuccess: () => {
      queryClient.invalidateQueries(['cards']);
      setShowForm(false);
      setFormData({ dailyLimit: 500, monthlyLimit: 5000, merchantRestrictions: [] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    issueCardMutation.mutate(formData);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Corporate Cards</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          {showForm ? 'Cancel' : '+ Issue Card'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-bold mb-4">Issue New Card</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Daily Limit ($)</label>
                <input
                  type="number"
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData({...formData, dailyLimit: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Limit ($)</label>
                <input
                  type="number"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({...formData, monthlyLimit: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={issueCardMutation.isPending}
              className="bg-secondary text-white px-6 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {issueCardMutation.isPending ? 'Issuing...' : 'Issue Card'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">No cards issued yet. Issue your first card above.</p>
        </div>
      </div>
    </div>
  );
}
