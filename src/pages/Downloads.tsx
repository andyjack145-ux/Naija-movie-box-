import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'
import { getAllMovies, isMoviePaid, markMoviePaid } from '../utils/storage'
import { toDownloadUrl } from '../utils/cloudUrl'
import { Movie } from '../types'
import { useAuth } from '../context/AuthContext'

const AD_FREE_PRICE = 200

declare global {
  interface Window { PaystackPop: any }
}

export function Downloads() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paidMovies, setPaidMovies] = useState<Movie[]>([])
  const [otherMovies, setOtherMovies] = useState<Movie[]>([])
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const all = getAllMovies(MOCK_MOVIES)
    if (user?.email) {
      setPaidMovies(all.filter((m) => isMoviePaid(m.id, user.email) && m.videoUrl))
      setOtherMovies(all.filter((m) => !isMoviePaid(m.id, user.email) && m.videoUrl))
    } else {
      setPaidMovies([])
      setOtherMovies(all.filter((m) => m.videoUrl))
    }
  }, [user])

  function triggerDownload(movie: Movie) {
    if (!movie.videoUrl) return
    setDownloading(movie.id)
    const url = toDownloadUrl(movie.videoUrl)
    const a = document.createElement('a')
    a.href = url
    a.download = `${movie.title}.mp4`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDownloading(null), 2000)
  }

  function handlePay(movieId: string, movieTitle: string) {
    if (!user?.email) { navigate('/login'); return }
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      alert('Payment is not live yet. Please check back soon.')
      return
    }
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: user.email,
      amount: AD_FREE_PRICE * 100,
      currency: 'NGN',
      ref: `adFree_${movieId}_${Date.now()}`,
      metadata: { movieId, movieTitle },
      onClose() {},
      callback() {
        markMoviePaid(movieId, user.email)
        const all = getAllMovies(MOCK_MOVIES)
        setPaidMovies(all.filter((m) => isMoviePaid(m.id, user.email) && m.videoUrl))
        setOtherMovies(all.filter((m) => !isMoviePaid(m.id, user.email) && m.videoUrl))
      },
    })
    handler.openIframe()
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="text-2xl font-bold mb-2">Login to Download</h2>
        <p className="text-gray-400 mb-6 max-w-sm">
          You need to be logged in and pay ₦200 per movie to unlock downloads.
        </p>
        <Link to="/login" className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-3 rounded-xl font-semibold">
          Login / Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Downloads</h1>
      <p className="text-gray-400 text-sm mb-8">Pay ₦200 per movie to unlock ad-free streaming and downloads.</p>

      {/* Unlocked movies */}
      {paidMovies.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 text-green-400">✓ Your Unlocked Movies ({paidMovies.length})</h2>
          <div className="space-y-3">
            {paidMovies.map((m) => (
              <div key={m.id} className="flex items-center gap-4 bg-[#111] border border-green-900 rounded-xl p-4">
                {m.posterUrl ? (
                  <img src={m.posterUrl} alt={m.title} className="w-14 h-20 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-14 h-20 bg-[#222] rounded-lg shrink-0 flex items-center justify-center text-2xl">🎬</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{m.title}</p>
                  <p className="text-sm text-gray-400">{m.year} · {m.category}</p>
                  <p className="text-xs text-green-500 mt-1">Ad-free unlocked</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/player/${m.id}`}
                    className="text-xs bg-green-700 hover:bg-green-600 transition-colors px-4 py-2 rounded-lg text-center"
                  >
                    Watch
                  </Link>
                  <button
                    onClick={() => triggerDownload(m)}
                    disabled={downloading === m.id}
                    className="text-xs bg-[#1a1a1a] border border-[#333] hover:bg-[#222] transition-colors px-4 py-2 rounded-lg disabled:opacity-60"
                  >
                    {downloading === m.id ? 'Starting…' : '⬇ Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked movies */}
      {otherMovies.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-400">
            {paidMovies.length === 0 ? 'All Movies' : 'More Movies'}
          </h2>
          <div className="space-y-3">
            {otherMovies.map((m) => (
              <div key={m.id} className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-xl p-4 opacity-80">
                {m.posterUrl ? (
                  <img src={m.posterUrl} alt={m.title} className="w-14 h-20 object-cover rounded-lg shrink-0 grayscale-[40%]" />
                ) : (
                  <div className="w-14 h-20 bg-[#222] rounded-lg shrink-0 flex items-center justify-center text-2xl">🎬</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{m.title}</p>
                  <p className="text-sm text-gray-400">{m.year} · {m.category}</p>
                  <p className="text-xs text-gray-600 mt-1">🔒 Pay ₦200 to unlock ad-free + download</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/player/${m.id}`}
                    className="text-xs bg-[#222] hover:bg-[#2a2a2a] transition-colors px-4 py-2 rounded-lg text-center"
                  >
                    Watch Free
                  </Link>
                  <button
                    onClick={() => handlePay(m.id, m.title)}
                    className="text-xs bg-yellow-700 hover:bg-yellow-600 transition-colors px-4 py-2 rounded-lg font-medium"
                  >
                    Pay ₦{AD_FREE_PRICE}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {paidMovies.length === 0 && otherMovies.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🎬</p>
          <p>No movies available yet.</p>
        </div>
      )}
    </div>
  )
}
