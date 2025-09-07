import React, { useState } from 'react';

interface SignFormData {
  payload: string;
  secret: string;
  algorithm: string;
  expiresIn: string;
  issuer: string;
  audience: string;
}

export default function SignForm() {
  const [formData, setFormData] = useState<SignFormData>({
    payload: JSON.stringify({ sub: 'user123', role: 'admin', name: 'John Doe' }, null, 2),
    secret: 'your-secret-key',
    algorithm: 'HS256',
    expiresIn: '1h',
    issuer: '',
    audience: ''
  });
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(JSON.stringify(data, null, 2));
      } else {
        setError(data.error || 'Failed to sign JWT');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payload (JSON)
          </label>
          <textarea
            value={formData.payload}
            onChange={(e) => handleInputChange('payload', e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="JWT payload as JSON"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key
            </label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) => handleInputChange('secret', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Secret key for signing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Algorithm
            </label>
            <select
              value={formData.algorithm}
              onChange={(e) => handleInputChange('algorithm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="HS256">HS256</option>
              <option value="HS384">HS384</option>
              <option value="HS512">HS512</option>
              <option value="RS256">RS256</option>
              <option value="ES256">ES256</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires In
            </label>
            <input
              type="text"
              value={formData.expiresIn}
              onChange={(e) => handleInputChange('expiresIn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1h, 30m, 7d"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuer (optional)
            </label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => handleInputChange('issuer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://auth.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audience (optional)
            </label>
            <input
              type="text"
              value={formData.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing...' : 'Sign JWT'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-green-800 font-medium mb-2">JWT Signed Successfully!</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}