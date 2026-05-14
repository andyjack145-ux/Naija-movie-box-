import React from 'react'
import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-[#111] border-b border-[#222]">
      <Link to="/" className="text-2xl font-bold text-green-500">
        9JA STREAM
      </Link>

      <div className="flex gap-4">
        <Link to="/downloads">Downloads</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  )
}
