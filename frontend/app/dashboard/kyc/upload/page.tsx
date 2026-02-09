'use client';
import React, { useState } from 'react';
import { getApiUrl } from '@/utils/urlValidator';

export default function KYCUpload() {
  const [tier, setTier] = useState('ace');
  const [files, setFiles] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    formData.append('tier', tier);
    Object.entries(files).forEach(([key, file]) => formData.append(key, file));

    try {
      await fetch(getApiUrl('/kyc/verify'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6">KYC Verification</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <select value={tier} onChange={e => setTier(e.target.value)} className="w-full border rounded-lg p-3">
            <option value="atlantic">Atlantic ($5K)</option>
            <option value="ace">ACE ($50K)</option>
            <option value="turbo">Turbo ($100K)</option>
            <option value="business">Business ($20M)</option>
          </select>
          {tier !== 'atlantic' && (
            <>
              <FileInput label="Photo ID" onChange={(f: File) => setFiles({ ...files, photoId: f })} />
              <FileInput label="Proof of Address" onChange={(f: File) => setFiles({ ...files, address: f })} />
            </>
          )}
          <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white py-3 rounded-lg">
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FileInput({ label, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input type="file" onChange={e => onChange(e.target.files?.[0])} className="w-full border rounded-lg p-3" />
    </div>
  );
}
