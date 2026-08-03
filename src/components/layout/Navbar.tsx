import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ADMIN_EMAIL = 'andyntuk@gmail.com'

export function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.email === ADMIN_EMAIL
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMenuOpen(false)
    }
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { to: '/search', label: 'Browse' },
    { to: '/downloads', label: 'Downloads' },
    { to: '/upgrade', label: 'Premium' },
    ...(user ? [{ to: '/watchlist', label: 'Watchlist' }] : []),
    { to: '/submit', label: 'Submit a Movie' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel', admin: true }] : []),
    user
      ? { to: '/profile', label: 'Profile', highlight: true }
      : { to: '/login', label: 'Login', highlight: true },
  ]

  return (
    <nav className="flex items-center gap-3 px-4 py-3 bg-[#111] border-b border-[#222] relative z-50">
      <Link to="/" className="text-xl font-bold text-green-500 shrink-0">
        9JA STREAM
      </Link>

      <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
          className="w-full px-4 py-2 rounded-full bg-[#222] text-white text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </form>

      <div ref={menuRef} className="ml-auto relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-[#222] hover:bg-[#2a2a2a] transition-colors gap-1.5"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 w-56 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-5 py-3.5 text-sm font-medium border-b border-[#222] last:border-0 transition-colors
                  ${'admin' in link && link.admin
                    ? 'text-yellow-400 hover:bg-yellow-500/10'
                    : 'highlight' in link && link.highlight
                    ? 'text-green-400 hover:bg-green-500/10'
                    : 'text-gray-300 hover:bg-[#252525] hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
