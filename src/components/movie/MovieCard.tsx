import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Movie } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../../utils/storage'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user?.email) {
      isInWatchlist(movie.id, user.email).then(setSaved)
    }
  }, [movie.id, user?.email])

  async function toggleWatchlist(e: React.MouseEvent) {
    e.preventDefault()
    if (!user?.email) return
    if (saved) {
      await removeFromWatchlist(movie.id, user.email)
      setSaved(false)
    } else {
      await addToWatchlist(movie.id, user.email)
      setSaved(true)
    }
  }

  return (
    <Link to={`/movie/${movie.id}`} className="block group">
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-[#1a1a1a]">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {user && (
          <button
            onClick={toggleWatchlist}
            className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-1.5 transition-colors"
            title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={saved ? '#16a34a' : 'none'}
              stroke={saved ? '#16a34a' : 'white'}
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <div>
            <p className="font-semibold text-sm leading-tight">{movie.title}</p>
            <p className="text-xs text-gray-400">{movie.year}</p>
          </div>
        </div>
      </div>
      <div className="mt-2 px-1">
        <p className="font-medium text-sm truncate">{movie.title}</p>
        <p className="text-xs text-gray-500">{movie.year}</p>
      </div>
    </Link>
  )
}
