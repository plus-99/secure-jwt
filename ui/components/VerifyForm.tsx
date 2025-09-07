import React, { useState } from 'react';

interface VerifyFormData {
  token: string;
  secret: string;
  algorithm: string;
  issuer: string;
  audience: string;
  jwksUri: string;
}

export default function VerifyForm() {
  const [formData, setFormData] = useState<VerifyFormData>({
    token: '',
    secret: 'your-secret-key',
    algorithm: 'HS256',
    issuer: '',
    audience: '',
    jwksUri: ''
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
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(JSON.stringify(data, null, 2));
      } else {
        setError(data.error || 'Failed to verify JWT');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof VerifyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JWT Token
          </label>
          <textarea
            value={formData.token}
            onChange={(e) => handleInputChange('token', e.target.value)}
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste JWT token here..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Method
            </label>
            <select
              onChange={(e) => {
                const method = e.target.value;
                if (method === 'secret') {
                  setFormData(prev => ({ ...prev, jwksUri: '' }));
                } else {
                  setFormData(prev => ({ ...prev, secret: '' }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="secret">Secret Key</option>
              <option value="jwks">JWKS URI</option>
            </select>
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

        {!formData.jwksUri && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key
            </label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) => handleInputChange('secret', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Secret key used for signing"
            />
          </div>
        )}

        {formData.jwksUri && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JWKS URI
            </label>
            <input
              type="url"
              value={formData.jwksUri}
              onChange={(e) => handleInputChange('jwksUri', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-provider/.well-known/jwks.json"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Issuer (optional)
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
              Expected Audience (optional)
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
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify JWT'}
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
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-blue-800 font-medium mb-2">Verification Result</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
            {result}
          </pre>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-yellow-800 font-medium mb-2">🏢 Enterprise Examples</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <div><strong>Auth0:</strong> https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json</div>
          <div><strong>AWS Cognito:</strong> https://cognito-idp.REGION.amazonaws.com/USER_POOL_ID/.well-known/jwks.json</div>
          <div><strong>Okta:</strong> https://YOUR_DOMAIN.okta.com/oauth2/default/.well-known/jwks.json</div>
        </div>
      </div>
    </div>
  );
}