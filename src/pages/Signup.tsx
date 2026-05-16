import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const result = signup(name.trim(), email.trim(), password)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Sign up failed.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-[#111] border border-[#222] p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Create account</h1>
        <p className="text-gray-400 text-sm mb-8">Join 9JA STREAM and start watching</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

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
              placeholder="At least 6 characters"
              required
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
