import React, { useState, useEffect } from 'react'
import { saveMovie, getSavedMovies, deleteMovie } from '../utils/storage'
import { Movie } from '../types'

const ADMIN_PASSWORD = 'admin9ja'

const CATEGORIES = ['Nollywood', 'Hollywood', 'Bollywood', 'K-Drama', 'Series', 'Other']

function generateId() {
  return 'movie_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}

const emptyForm = {
  title: '',
  year: new Date().getFullYear(),
  rating: 7.0,
  duration: '',
  genres: '',
  synopsis: '',
  cast: '',
  posterUrl: '',
  backdropUrl: '',
  category: 'Nollywood',
  videoUrl: '',
  access: 'free' as 'free' | 'paid',
  price: 200,
  isTrending: false,
  isNewRelease: true,
}

export function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [movies, setMovies] = useState<Movie[]>([])
  const [saved, setSaved] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setMovies(getSavedMovies())
  }, [])

  function handleLogin() {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked
        : name === 'year' || name === 'price' || name === 'rating' ? Number(value)
        : value,
    }))
  }

  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.checked }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const movie: Movie = {
      id: editingId || generateId(),
      title: form.title,
      year: form.year,
      rating: form.rating,
      duration: form.duration,
      genres: form.genres.split(',').map((g) => g.trim()).filter(Boolean),
      synopsis: form.synopsis,
      cast: form.cast.split(',').map((c) => c.trim()).filter(Boolean),
      posterUrl: form.posterUrl,
      backdropUrl: form.backdropUrl || form.posterUrl,
      category: form.category,
      videoUrl: form.videoUrl,
      access: form.access,
      price: form.access === 'paid' ? form.price : undefined,
      isTrending: form.isTrending,
      isNewRelease: form.isNewRelease,
    }
    saveMovie(movie)
    setMovies(getSavedMovies())
    setForm(emptyForm)
    setEditingId(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleEdit(movie: Movie) {
    setForm({
      title: movie.title,
      year: movie.year,
      rating: movie.rating,
      duration: movie.duration || '',
      genres: (movie.genres || []).join(', '),
      synopsis: movie.synopsis,
      cast: (movie.cast || []).join(', '),
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl || '',
      category: movie.category || 'Nollywood',
      videoUrl: movie.videoUrl || '',
      access: movie.access || 'free',
      price: movie.price || 200,
      isTrending: movie.isTrending || false,
      isNewRelease: movie.isNewRelease || false,
    })
    setEditingId(movie.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id: string) {
    if (confirm('Delete this movie?')) {
      deleteMovie(id)
      setMovies(getSavedMovies())
    }
  }

  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[#111] p-8 rounded-2xl w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-green-500">Admin Login</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full p-3 rounded-lg bg-[#222] mb-3 text-white outline-none"
          />
          {pwError && <p className="text-red-400 text-sm mb-3">Incorrect password</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-green-500">Admin Panel</h1>
      <p className="text-gray-400 mb-8 text-sm">Add movies using Google Drive or Dropbox share links</p>

      <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-10 space-y-4">
        <h2 className="text-xl font-semibold mb-2">
          {editingId ? 'Edit Movie' : 'Add New Movie'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Movie Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="e.g. King of Boys"
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Year</label>
            <input name="year" type="number" value={form.year} onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Rating (0–10)</label>
            <input name="rating" type="number" step="0.1" min="0" max="10" value={form.rating} onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Duration</label>
            <input name="duration" value={form.duration} onChange={handleChange}
              placeholder="e.g. 2h 10m"
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Genres (comma-separated)</label>
            <input name="genres" value={form.genres} onChange={handleChange}
              placeholder="e.g. Action, Drama, Thriller"
              className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Cast (comma-separated)</label>
          <input name="cast" value={form.cast} onChange={handleChange}
            placeholder="e.g. Sola Sobowale, Funke Akindele"
            className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Synopsis</label>
          <textarea name="synopsis" value={form.synopsis} onChange={handleChange} rows={3}
            placeholder="Brief description of the movie..."
            className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500 resize-none" />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Poster Image URL</label>
          <input name="posterUrl" value={form.posterUrl} onChange={handleChange}
            placeholder="https://... (direct image link)"
            className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Backdrop Image URL (optional, uses poster if blank)</label>
          <input name="backdropUrl" value={form.backdropUrl} onChange={handleChange}
            placeholder="https://... (wide banner image)"
            className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">
            Video URL — Google Drive or Dropbox share link *
          </label>
          <input name="videoUrl" value={form.videoUrl} onChange={handleChange} required
            placeholder="https://drive.google.com/file/d/... or https://www.dropbox.com/..."
            className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
          <p className="text-xs text-gray-500 mt-1">
            Google Drive: share link with "Anyone with the link" access. Dropbox: share link ending in ?dl=0
          </p>
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Access</label>
            <select name="access" value={form.access} onChange={handleChange}
              className="p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500">
              <option value="free">Free (with ads)</option>
              <option value="paid">Paid (one-time)</option>
            </select>
          </div>

          {form.access === 'paid' && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Price (₦)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange}
                className="w-32 p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="isTrending" checked={form.isTrending} onChange={handleCheckbox}
              className="w-4 h-4 accent-green-500" />
            <span className="text-sm text-gray-300">Trending</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="isNewRelease" checked={form.isNewRelease} onChange={handleCheckbox}
              className="w-4 h-4 accent-green-500" />
            <span className="text-sm text-gray-300">New Release</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-3 rounded-xl font-semibold">
            {editingId ? 'Update Movie' : 'Add Movie'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null) }}
              className="bg-[#222] hover:bg-[#333] transition-colors px-8 py-3 rounded-xl">
              Cancel
            </button>
          )}
          {saved && <span className="text-green-400 self-center text-sm">Saved successfully!</span>}
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-4">Uploaded Movies ({movies.length})</h2>

      {movies.length === 0 ? (
        <p className="text-gray-500">No movies added yet.</p>
      ) : (
        <div className="space-y-3">
          {movies.map((m) => (
            <div key={m.id} className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-xl p-4">
              <img src={m.posterUrl} alt={m.title}
                className="w-14 h-20 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{m.title}</p>
                <p className="text-sm text-gray-400">{m.year} · {m.category}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {m.access === 'paid' ? `Paid — ₦${m.price}` : 'Free with ads'}
                </p>
                {m.videoUrl && (
                  <p className="text-xs text-green-600 mt-1 truncate">
                    {m.videoUrl.includes('drive.google') ? 'Google Drive' : m.videoUrl.includes('dropbox') ? 'Dropbox' : 'Direct'}: {m.videoUrl.slice(0, 50)}...
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => handleEdit(m)}
                  className="text-xs bg-[#222] hover:bg-[#333] px-3 py-1.5 rounded-lg transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(m.id)}
                  className="text-xs bg-red-900/40 hover:bg-red-900/70 text-red-400 px-3 py-1.5 rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
