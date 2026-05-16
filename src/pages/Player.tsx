import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'
import { getAllMovies, isMoviePaid } from '../utils/storage'
import { toStreamableUrl, detectCloudSource } from '../utils/cloudUrl'
import { Movie } from '../types'
import { useAuth } from '../context/AuthContext'

const FALLBACK_URL = 'https://www.w3schools.com/html/mov_bbb.mp4'
const AD_DURATION = 10

export function Player() {
  const { id } = useParams()
  const { user } = useAuth()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [paid, setPaid] = useState(false)
  const [adPlaying, setAdPlaying] = useState(false)
  const [adCountdown, setAdCountdown] = useState(AD_DURATION)
  const [adDone, setAdDone] = useState(false)

  useEffect(() => {
    const all = getAllMovies(MOCK_MOVIES)
    const found = all.find((m) => m.id === id) || null
    setMovie(found)
    if (found && user?.email) {
      const hasPaid = isMoviePaid(found.id, user.email)
      setPaid(hasPaid)
      if (!hasPaid && found.access !== 'paid') {
        setAdPlaying(true)
      } else {
        setAdDone(true)
      }
    } else {
      setAdPlaying(true)
    }
  }, [id, user])

  useEffect(() => {
    if (!adPlaying) return
    if (adCountdown <= 0) {
      setAdPlaying(false)
      setAdDone(true)
      return
    }
    const t = setTimeout(() => setAdCountdown((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [adPlaying, adCountdown])

  if (!movie) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Movie not found.</div>
  )

  const rawUrl = movie.videoUrl || FALLBACK_URL
  const source = detectCloudSource(rawUrl)
  const streamUrl = toStreamableUrl(rawUrl)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-4">
        <Link to={`/movie/${movie.id}`} className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
          ← Back to {movie.title}
        </Link>

        <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>

        {adPlaying && (
          <div className="relative w-full aspect-video bg-[#111] rounded-xl overflow-hidden mb-4 flex flex-col items-center justify-center">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 self-start">
                AD
              </div>
              <p className="text-2xl font-bold mb-2">9JA STREAM Premium</p>
              <p className="text-gray-400 mb-4">Watch ad-free with a premium subscription</p>
              <Link
                to="/upgrade"
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                Upgrade Now
              </Link>
              <p className="text-gray-500 text-sm mt-6">
                Movie starts in <span className="text-white font-bold">{adCountdown}s</span>
              </p>
            </div>
          </div>
        )}

        {adDone && (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
            {source === 'gdrive' ? (
              <iframe
                src={streamUrl}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
                title={movie.title}
              />
            ) : source === 'dropbox' ? (
              <video
                src={streamUrl}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support video playback.
              </video>
            ) : (
              <video
                src={streamUrl}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        )}

        {paid && (
          <p className="text-green-500 text-sm mt-3">Premium — watching ad-free</p>
        )}
      </div>
    </div>
  )
}
