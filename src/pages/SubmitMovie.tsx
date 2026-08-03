import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { addPendingSubmission } from '../utils/storage'
import { Movie } from '../types'

const CATEGORIES = ['Nollywood', 'Hollywood', 'Bollywood', 'K-Drama', 'Series', 'Other']
const GENRES = ['Action', 'Drama', 'Comedy', 'Romance', 'Thriller', 'Horror', 'Animation', 'Documentary']

export function SubmitMovie() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    synopsis: '',
    posterUrl: '',
    videoUrl: '',
    category: 'Nollywood',
    genres: [] as string[],
    access: 'free' as 'free' | 'paid',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 mb-4">You need to be logged in to submit a movie.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full text-white transition-colors"
        >
          Log In
        </button>
      </div>
    )
  }

  function toggleGenre(genre: string) {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(genre) ? f.genres.filter((g) => g !== genre) : [...f.genres, genre],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) return setError('Movie title is required.')
    if (!form.posterUrl.trim()) return setError('Poster URL is required.')
    if (!form.videoUrl.trim()) return setError('Video link is required.')

    const movie: Movie = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: form.title.trim(),
      year: parseInt(form.year) || new Date().getFullYear(),
      synopsis: form.synopsis.trim(),
      posterUrl: form.posterUrl.trim(),
      backdropUrl: form.posterUrl.trim(),
      videoUrl: form.videoUrl.trim(),
      category: form.category,
      genres: form.genres,
      access: form.access,
      rating: 0,
      isTrending: false,
      isNewRelease: true,
    }

    addPendingSubmission({
      movie,
      submittedBy: user?.email ?? '',
      submittedByName: user?.name || user?.email || '',
      submittedAt: Date.now(),
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">📬</p>
        <h2 className="text-2xl font-bold mb-2">Request Sent!</h2>
        <p className="text-gray-400 mb-2">Your movie has been sent to the admin for review.</p>
        <p className="text-gray-500 text-sm mb-8">Once approved, it will appear on 9JA STREAM for everyone to watch.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setSubmitted(false)
              setForm({ title: '', year: new Date().getFullYear().toString(), synopsis: '', posterUrl: '', videoUrl: '', category: 'Nollywood', genres: [], access: 'free' })
            }}
            className="border border-green-600 text-green-500 hover:bg-green-600 hover:text-white px-6 py-2 rounded-full text-sm transition-colors"
          >
            Submit Another
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full text-white text-sm transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Submit a Movie</h1>
      <p className="text-gray-400 text-sm mb-2">Share a movie with the 9JA STREAM community.</p>
      <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-3 mb-8 text-sm text-yellow-300">
        Your submission will be reviewed by the admin before going live.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Movie Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Living in Bondage"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-white text-sm outline-none focus:border-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-white text-sm outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-white text-sm outline-none focus:border-green-500"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Synopsis</label>
          <textarea
            value={form.synopsis}
            onChange={(e) => setForm((f) => ({ ...f, synopsis: e.target.value }))}
            placeholder="Brief description of the movie..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-white text-sm outline-none focus:border-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Genres</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  form.genres.includes(g)
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-[#444] text-gray-400 hover:border-green-500'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Poster Image URL *</label>
          <input
            value={form.posterUrl}
            onChange={(e) => setForm((f) => ({ ...f, posterUrl: e.target.value }))}
            placeholder="https://... (paste a direct image link)"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-white text-sm outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Video Link *</label>
          <input
            value={form.videoUrl}
            onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            placeholder="YouTube, Google Drive, or any video link"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-white text-sm outline-none focus:border-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">Paste a YouTube link, Google Drive share link, or any direct video URL</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Access</label>
          <div className="flex gap-3">
            {(['free', 'paid'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setForm((f) => ({ ...f, access: a }))}
                className={`px-5 py-2 rounded-full text-sm border transition-colors capitalize ${
                  form.access === a
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-[#444] text-gray-400 hover:border-green-500'
                }`}
              >
                {a === 'free' ? 'Free (with ads)' : 'Paid (₦200)'}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition-colors"
        >
          Send Request to Admin
        </button>
      </form>
    </div>
  )
}
