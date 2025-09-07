import React, { useState } from 'react';
import Head from 'next/head';
import SignForm from '../components/SignForm';
import VerifyForm from '../components/VerifyForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sign' | 'verify'>('sign');

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>@plus99/secure-jwt Playground</title>
        <meta name="description" content="Secure JWT library playground and testing interface" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔐 @plus99/secure-jwt
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Secure JWT library playground - Test signing, verification, and enterprise features
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                ✅ No "none" algorithm
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                🔒 Mandatory expiration
              </div>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                📝 TypeScript native
              </div>
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                🏢 Enterprise ready
              </div>
            </div>
          </header>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('sign')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'sign'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign JWT
                </button>
                <button
                  onClick={() => setActiveTab('verify')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'verify'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Verify JWT
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'sign' && <SignForm />}
              {activeTab === 'verify' && <VerifyForm />}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🆚 vs jsonwebtoken</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3">❌ jsonwebtoken issues</h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• Supports insecure "none" algorithm</li>
                  <li>• No default expiration</li>
                  <li>• Weak TypeScript support</li>
                  <li>• Generic error handling</li>
                  <li>• Blocking crypto operations</li>
                  <li>• No built-in JWKS support</li>
                </ul>
              </div>
              <div className="border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✅ @plus99/secure-jwt advantages</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Blocks "none" algorithm completely</li>
                  <li>• Mandatory expiration (1h default)</li>
                  <li>• Full TypeScript native support</li>
                  <li>• Typed error classes</li>
                  <li>• Async/non-blocking operations</li>
                  <li>• Built-in JWKS with caching</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .container {
          max-width: 1200px;
        }
      `}</style>
    </div>
  );
}