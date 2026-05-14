import React from 'react'

export function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[#111] p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Login</h1>

        <input
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-[#222] mb-4"
        />

        <button className="w-full bg-green-600 py-3 rounded-lg">
          Continue
        </button>
      </div>
    </div>
  )
}
