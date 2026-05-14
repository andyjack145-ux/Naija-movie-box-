import React from 'react'

export function Upgrade() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="bg-[#111] border border-[#222] p-8 rounded-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">
          Upgrade To Premium
        </h1>

        <div className="space-y-3 text-gray-400 mb-6">
          <p>✓ Watch movies without ads</p>
          <p>✓ Unlimited downloads</p>
          <p>✓ Better quality streaming</p>
          <p>✓ Early movie access</p>
        </div>

        <button className="bg-green-600 hover:bg-green-700 transition-colors w-full py-3 rounded-xl font-semibold">
          Subscribe
        </button>
      </div>
    </div>
  )
}
