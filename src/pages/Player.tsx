import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'
import { getAllMovies, isMoviePaid } from '../utils/storage'
import { toStreamableUrl, detectCloudSource } from '../utils/cloudUrl'
import { Movie } from '../types'
import { useAuth } from '../context/AuthContext'

const AD_DURATION = 10

export function Player() {
  const { id } = useParams()
  const { user } = useAuth()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [paid, setPaid] = useState(false)
  const [adCountdown, setAdCountdown] = useState(AD_DURATION)
  const [adDone, setAdDone] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function load() {
      const all = await getAllMovies(MOCK_MOVIES)
      const found = all.find((m) => m.id === id) || null
      setMovie(found)
      if (found && user?.email) {
        const hasPaid = await isMoviePaid(found.id, user.email)
        setPaid(hasPaid)
        if (hasPaid) setAdDone(true)
      }
    }
    load()
  }, [id, user])

  useEffect(() => {
    if (adDone) return
    if (adCountdown <= 0) {
      setAdDone(true)
      return
    }
    const t = setTimeout(() => setAdCountdown((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [adCountdown, adDone])

  if (!movie) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Movie not found.</div>
  )

  if (!movie.videoUrl) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 gap-4">
      <p>No video has been uploaded for this movie yet.</p>
      <Link to={`/movie/${movie.id}`} className="text-green-500 hover:underline">← Go back</Link>
    </div>
  )

  const source = detectCloudSource(movie.videoUrl)
  const streamUrl = toStreamableUrl(movie.videoUrl)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-4">
        <Link to={`/movie/${movie.id}`} className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
          ← Back to {movie.title}
        </Link>

        <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>

        <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-xl overflow-hidden">
          {/* Ad overlay */}
          {!adDone && (
            <div className="absolute inset-0 z-10 bg-[#0d0d0d] flex flex-col items-center justify-center p-8 text-center">
              <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-6 self-start absolute top-4 left-4">
                AD
              </span>
              <div className="max-w-sm">
                <p className="text-3xl font-black mb-3">9JA STREAM</p>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  Pay <span className="text-yellow-400 font-bold">₦200</span> once to watch this movie ad-free, anytime.
                </p>
                <Link
                  to={`/movie/${movie.id}`}
                  className="bg-yellow-600 hover:bg-yellow-700 px-8 py-3 rounded-xl text-sm font-semibold transition-colors inline-block mb-6"
                >
                  Pay ₦200 — Skip Ads
                </Link>
                <p className="text-gray-500 text-sm">
                  Your movie starts in <span className="text-white font-bold text-lg">{adCountdown}</span>s
                </p>
              </div>
            </div>
          )}

          {/* Video player */}
          {source === 'gdrive' || source === 'youtube' ? (
            <iframe
              src={streamUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={movie.title}
              style={{ border: 'none' }}
            />
          ) : (
            <video
              ref={videoRef}
              src={streamUrl}
              controls
              autoPlay={adDone}
              className="w-full h-full"
              onError={() => console.error('Video failed to load:', streamUrl)}
            >
              Your browser does not support video playback.
            </video>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {paid && (
            <span className="text-green-500 text-sm font-medium">✓ Premium — watching ad-free</span>
          )}
          {!paid && adDone && (
            <Link to={`/movie/${movie.id}`} className="text-yellow-500 text-sm hover:underline">
              Pay ₦200 to watch ad-free
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
