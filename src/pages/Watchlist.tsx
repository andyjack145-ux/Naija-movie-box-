import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getWatchlist, getAllMovies } from '../utils/storage'
import { MOCK_MOVIES } from '../data/mockData'
import { Movie } from '../types'
import { MovieCard } from '../components/movie/MovieCard'

export function Watchlist() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movies, setMovies] = useState<Movie[]>([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    async function load() {
      const [ids, all] = await Promise.all([
        getWatchlist(user!.email),
        getAllMovies(MOCK_MOVIES),
      ])
      setMovies(all.filter((m) => ids.includes(m.id)))
    }
    load()
  }, [user, navigate])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>
      {movies.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-lg mb-2">Your watchlist is empty</p>
          <p className="text-sm mb-6">Tap the bookmark icon on any movie to save it here</p>
          <Link to="/" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full text-white text-sm transition-colors">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}
