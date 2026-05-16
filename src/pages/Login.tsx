import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = login(email.trim(), password)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Login failed.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-[#111] border border-[#222] p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-8">Sign in to your 9JA STREAM account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition-colors py-3 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
