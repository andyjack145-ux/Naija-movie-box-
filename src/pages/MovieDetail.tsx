import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'
import { getAllMovies, isMoviePaid, markMoviePaid } from '../utils/storage'
import { Movie } from '../types'
import { useAuth } from '../context/AuthContext'

const AD_FREE_PRICE = 200

declare global {
  interface Window { PaystackPop: any }
}

export function MovieDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [paid, setPaid] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')

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
      navigate('/login')
      return
    }
    if (!movie) return
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPayError('Payment is not available yet. Please watch free with ads for now.')
      return
    }
    setPayLoading(true)
    setPayError('')
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: user.email,
      amount: AD_FREE_PRICE * 100,
      currency: 'NGN',
      ref: `adFree_${movie.id}_${Date.now()}`,
      metadata: { movieId: movie.id, movieTitle: movie.title },
      onClose() { setPayLoading(false) },
      callback() {
        markMoviePaid(movie.id, user.email)
        setPaid(true)
        setPayLoading(false)
        navigate(`/player/${movie.id}`)
      },
    })
    handler.openIframe()
  }

  if (!movie) return (
    <div className="p-6 text-center text-gray-400 mt-20">Movie not found.</div>
  )

  const hasVideo = !!movie.videoUrl

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
        <div className="mb-8">
          <h3 className="font-semibold mb-1 text-gray-400 text-sm uppercase tracking-wide">Cast</h3>
          <p className="text-gray-300">{movie.cast.join(', ')}</p>
        </div>
      )}

      {/* Watch options */}
      {!hasVideo ? (
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-center text-gray-500">
          Video coming soon
        </div>
      ) : paid ? (
        /* Already paid — go straight to ad-free player */
        <div className="bg-[#111] border border-green-800 rounded-2xl p-6">
          <p className="text-green-400 font-semibold mb-1">✓ You own the ad-free version</p>
          <p className="text-gray-400 text-sm mb-4">Enjoy watching without any interruptions.</p>
          <Link
            to={`/player/${movie.id}`}
            className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-3 rounded-xl font-semibold inline-block"
          >
            Watch Now (Ad-Free)
          </Link>
        </div>
      ) : (
        /* Two options side by side */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free with ads */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col">
            <div className="mb-4 flex-1">
              <p className="font-bold text-lg mb-1">Watch Free</p>
              <p className="text-gray-400 text-sm">Short ad before the movie starts. No payment needed.</p>
            </div>
            <Link
              to={`/player/${movie.id}`}
              className="bg-[#1a1a1a] border border-[#333] hover:bg-[#222] transition-colors px-6 py-3 rounded-xl text-center font-medium"
            >
              Watch with Ads
            </Link>
          </div>

          {/* Pay ₦200 ad-free */}
          <div className="bg-[#111] border border-yellow-700 rounded-2xl p-6 flex flex-col">
            <div className="mb-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-lg">Ad-Free</p>
                <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">₦{AD_FREE_PRICE}</span>
              </div>
              <p className="text-gray-400 text-sm">Pay once, watch this movie ad-free anytime. One-time purchase.</p>
            </div>
            <button
              onClick={handlePaystack}
              disabled={payLoading}
              className="bg-yellow-600 hover:bg-yellow-700 transition-colors px-6 py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {payLoading ? 'Processing...' : `Pay ₦${AD_FREE_PRICE} & Watch`}
            </button>
            {payError && <p className="text-red-400 text-xs mt-2">{payError}</p>}
            {!user && (
              <p className="text-gray-500 text-xs mt-2 text-center">
                <Link to="/login" className="text-green-400 hover:underline">Log in</Link> to purchase
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
