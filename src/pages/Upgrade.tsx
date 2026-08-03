import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'
import { getAllMovies, getPaidMovieIds, markMoviePaid } from '../utils/storage'
import { useAuth } from '../context/AuthContext'
import { Movie } from '../types'

const AD_FREE_PRICE = 200

declare global {
  interface Window { PaystackPop: any }
}

export function Upgrade() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set())

  async function loadData() {
    const movies = await getAllMovies(MOCK_MOVIES)
    setAllMovies(movies)
    if (user?.email) {
      const ids = await getPaidMovieIds(user.email)
      setPaidIds(new Set(ids))
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  function handlePay(movieId: string, movieTitle: string) {
    if (!user?.email) { navigate('/login'); return }
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_d278bb5641ab08317fde54de73fc2d23956ba322'
    if (!window.PaystackPop) {
      alert('Payment system is still loading. Please wait a moment and try again.')
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
      async callback() {
        await markMoviePaid(movieId, user!.email)
        navigate(`/player/${movieId}`)
      },
    })
    handler.openIframe()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-800 rounded-3xl p-8 mb-10 text-center">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
        <h1 className="text-4xl font-black mb-4">Watch Movies Your Way</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Every movie is free to stream with a short ad. Pay <span className="text-yellow-400 font-bold">₦200</span> once per movie to remove the ad forever.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
          <div className="bg-[#111] border border-[#222] rounded-2xl p-5">
            <p className="text-2xl mb-2">📺</p>
            <p className="font-bold mb-1">Free</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>✓ Watch any movie</li>
              <li>✓ No account needed</li>
              <li className="text-gray-600">· Short ad before movie</li>
            </ul>
          </div>
          <div className="bg-[#111] border border-yellow-700 rounded-2xl p-5">
            <p className="text-2xl mb-2">⚡</p>
            <p className="font-bold mb-1">Ad-Free <span className="text-yellow-400">₦200</span></p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>✓ No ads — ever</li>
              <li>✓ One-time per movie</li>
              <li>✓ Watch anytime</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Movie list */}
      <h2 className="text-xl font-bold mb-5">Pick a Movie to Watch Ad-Free</h2>
      <div className="space-y-3">
        {allMovies.map((m) => {
          const alreadyPaid = paidIds.has(m.id)
          return (
            <div key={m.id} className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-xl p-4">
              {m.posterUrl ? (
                <img src={m.posterUrl} alt={m.title} className="w-14 h-20 object-cover rounded-lg shrink-0" />
              ) : (
                <div className="w-14 h-20 bg-[#222] rounded-lg shrink-0 flex items-center justify-center text-2xl">🎬</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{m.title}</p>
                <p className="text-sm text-gray-400">{m.year} · {m.category}</p>
                {alreadyPaid && (
                  <p className="text-xs text-green-400 mt-1">✓ You own the ad-free version</p>
                )}
              </div>
              <div className="shrink-0">
                {alreadyPaid ? (
                  <Link
                    to={`/player/${m.id}`}
                    className="text-sm bg-green-700 hover:bg-green-600 transition-colors px-4 py-2 rounded-lg inline-block"
                  >
                    Watch
                  </Link>
                ) : m.videoUrl ? (
                  <button
                    onClick={() => handlePay(m.id, m.title)}
                    className="text-sm bg-yellow-600 hover:bg-yellow-700 transition-colors px-4 py-2 rounded-lg font-medium"
                  >
                    Pay ₦{AD_FREE_PRICE}
                  </button>
                ) : (
                  <span className="text-xs text-gray-600 px-4 py-2">Coming soon</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!user && (
        <div className="mt-8 text-center bg-[#111] border border-[#222] rounded-2xl p-6">
          <p className="text-gray-400 mb-3">Log in to track your purchases and access ad-free movies anytime.</p>
          <Link to="/login" className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-3 rounded-xl font-semibold inline-block">
            Login / Sign Up
          </Link>
        </div>
      )}
    </div>
  )
}
