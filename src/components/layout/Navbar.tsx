import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <nav className="flex items-center gap-4 p-4 bg-[#111] border-b border-[#222] flex-wrap">
      <Link to="/" className="text-2xl font-bold text-green-500 shrink-0">
        9JA STREAM
      </Link>

      <form onSubmit={handleSearch} className="flex-1 min-w-[180px] max-w-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
          className="w-full px-4 py-2 rounded-full bg-[#222] text-white text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </form>

      <div className="flex gap-3 items-center ml-auto text-sm flex-wrap">
        <Link to="/search" className="text-gray-400 hover:text-white transition-colors">Browse</Link>
        <Link to="/downloads" className="text-gray-400 hover:text-white transition-colors">Downloads</Link>
        <Link to="/upgrade" className="text-gray-400 hover:text-white transition-colors">Premium</Link>
        {user ? (
          <Link to="/profile" className="bg-green-600 hover:bg-green-700 transition-colors px-3 py-1.5 rounded-full">
            Profile
          </Link>
        ) : (
          <Link to="/login" className="bg-green-600 hover:bg-green-700 transition-colors px-3 py-1.5 rounded-full">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
