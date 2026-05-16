import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-400">You are not logged in.</p>
        <Link to="/login" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl transition-colors">
          Sign In
        </Link>
      </div>
    )
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-[#222] pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Plan</span>
            <span className="text-white font-medium">Free</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Email</span>
            <span className="text-white">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          to="/upgrade"
          className="w-full bg-green-600 hover:bg-green-700 transition-colors py-3 rounded-xl text-center font-semibold"
        >
          Upgrade to Premium
        </Link>
        <Link
          to="/downloads"
          className="w-full bg-[#111] border border-[#222] hover:bg-[#1a1a1a] transition-colors py-3 rounded-xl text-center"
        >
          My Downloads
        </Link>
        <button
          onClick={handleLogout}
          className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 transition-colors py-3 rounded-xl font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
