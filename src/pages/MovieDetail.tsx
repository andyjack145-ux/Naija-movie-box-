import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'
import { getAllMovies, isMoviePaid, markMoviePaid } from '../utils/storage'
import { Movie } from '../types'
import { useAuth } from '../context/AuthContext'

declare global {
  interface Window {
    PaystackPop: any
  }
}

export function MovieDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [paid, setPaid] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  useEffect(() => {
    const all = getAllMovies(MOCK_MOVIES)
    const found = all.find((m) => m.id === id) || null
    setMovie(found)
    if (found && user?.email) {
      setPaid(isMoviePaid(found.id, user.email))
    }
  }, [id, user])

  function handlePaystack() {
    if (!user?.email) {
      alert('Please log in first to purchase this movie.')
      return
    }
    if (!movie) return
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      alert('Payment is not configured yet. Please check back soon.')
      return
    }
    setPayLoading(true)
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: user.email,
      amount: (movie.price || 200) * 100,
      currency: 'NGN',
      ref: `movie_${movie.id}_${Date.now()}`,
      metadata: { movieId: movie.id, movieTitle: movie.title },
      onClose() {
        setPayLoading(false)
      },
      callback(response: any) {
        markMoviePaid(movie.id, user.email)
        setPaid(true)
        setPayLoading(false)
      },
    })
    handler.openIframe()
  }

  if (!movie) return (
    <div className="p-6 text-center text-gray-400 mt-20">Movie not found.</div>
  )

  const canWatch = movie.access !== 'paid' || paid

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <img
        src={movie.backdropUrl || movie.posterUrl}
        className="w-full h-[400px] object-cover rounded-2xl mb-6"
        alt={movie.title}
      />

      <div className="flex flex-wrap gap-2 mb-3">
        {movie.isTrending && (
          <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">Trending</span>
        )}
        {movie.isNewRelease && (
          <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">New Release</span>
        )}
        {movie.category && (
          <span className="bg-[#222] text-gray-300 text-xs px-2 py-1 rounded-full">{movie.category}</span>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
        {movie.year && <span>{movie.year}</span>}
        {movie.duration && <span>{movie.duration}</span>}
        {movie.rating && <span>⭐ {movie.rating}/10</span>}
      </div>

      {movie.genres && movie.genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genres.map((g) => (
            <span key={g} className="bg-[#1a1a1a] border border-[#333] text-sm px-3 py-1 rounded-full">{g}</span>
          ))}
        </div>
      )}

      <p className="text-gray-300 mb-6 leading-relaxed">{movie.synopsis}</p>

      {movie.cast && movie.cast.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-1 text-gray-400 text-sm uppercase tracking-wide">Cast</h3>
          <p className="text-gray-300">{movie.cast.join(', ')}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canWatch ? (
          <>
            {movie.videoUrl ? (
              <Link
                to={`/player/${movie.id}`}
                className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-3 rounded-xl font-semibold inline-block"
              >
                {paid ? 'Watch (Premium)' : 'Watch Free With Ads'}
              </Link>
            ) : (
              <span className="bg-[#222] px-6 py-3 rounded-xl text-gray-400">No video available yet</span>
            )}
          </>
        ) : (
          <button
            onClick={handlePaystack}
            disabled={payLoading}
            className="bg-yellow-600 hover:bg-yellow-700 transition-colors px-6 py-3 rounded-xl font-semibold disabled:opacity-60"
          >
            {payLoading ? 'Processing...' : `Pay ₦${movie.price || 200} To Watch Ad-Free`}
          </button>
        )}

        {movie.access === 'paid' && !paid && movie.videoUrl && (
          <Link
            to={`/player/${movie.id}`}
            className="bg-[#1a1a1a] border border-[#333] hover:bg-[#222] transition-colors px-6 py-3 rounded-xl"
          >
            Watch Free With Ads
          </Link>
        )}
      </div>
    </div>
  )
}
