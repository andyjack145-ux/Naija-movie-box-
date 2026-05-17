import React, { useState, useEffect, useRef } from 'react'
import { saveMovie, getSavedMovies, deleteMovie, getStats } from '../utils/storage'
import { Movie } from '../types'
import { MOCK_MOVIES } from '../data/mockData'

const ADMIN_EMAIL = 'andyntuk@gmail.com'
const ADMIN_PASSWORD = '12345678'
const CATEGORIES = ['Nollywood', 'Hollywood', 'Bollywood', 'K-Drama', 'Series', 'Other']
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'
const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/original'

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

type UploadMode = 'link' | 'file'

export function Admin() {
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'movies'>('dashboard')
  const [adminEmail, setAdminEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [movies, setMovies] = useState<Movie[]>([])
  const [stats, setStats] = useState(getStats())
  const [saved, setSaved] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadMode, setUploadMode] = useState<UploadMode>('file')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // TMDB auto-fill
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<any[]>([])
  const [tmdbSearching, setTmdbSearching] = useState(false)
  const [tmdbError, setTmdbError] = useState('')

  async function searchTmdb() {
    if (!tmdbQuery.trim()) return
    if (!TMDB_KEY) {
      setTmdbError('Add your VITE_TMDB_API_KEY secret to enable auto-fill.')
      return
    }
    setTmdbSearching(true)
    setTmdbError('')
    setTmdbResults([])
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(tmdbQuery)}&language=en-US&page=1`
      )
      const data = await res.json()
      setTmdbResults((data.results || []).slice(0, 6))
    } catch {
      setTmdbError('Search failed. Check your API key.')
    } finally {
      setTmdbSearching(false)
    }
  }

  async function fillFromTmdb(movie: any) {
    setTmdbResults([])
    setTmdbQuery('')
    // Get full details + credits
    let cast: string[] = []
    let runtime = ''
    try {
      if (TMDB_KEY) {
        const [detailRes, creditsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_KEY}&language=en-US`),
          fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_KEY}`),
        ])
        const detail = await detailRes.json()
        const credits = await creditsRes.json()
        cast = (credits.cast || []).slice(0, 6).map((c: any) => c.name)
        if (detail.runtime) {
          const h = Math.floor(detail.runtime / 60)
          const m = detail.runtime % 60
          runtime = h > 0 ? `${h}h ${m}m` : `${m}m`
        }
      }
    } catch {}
    setForm((f) => ({
      ...f,
      title: movie.title || '',
      year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : f.year,
      rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : f.rating,
      synopsis: movie.overview || '',
      posterUrl: movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : f.posterUrl,
      backdropUrl: movie.backdrop_path ? `${TMDB_BACKDROP}${movie.backdrop_path}` : f.backdropUrl,
      genres: (movie.genre_ids || []).length > 0
        ? mapTmdbGenres(movie.genre_ids).join(', ')
        : f.genres,
      cast: cast.join(', '),
      duration: runtime || f.duration,
    }))
  }

  function mapTmdbGenres(ids: number[]): string[] {
    const map: Record<number, string> = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
      53: 'Thriller', 10752: 'War', 37: 'Western',
    }
    return ids.map((id) => map[id]).filter(Boolean)
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  useEffect(() => {
    setMovies(getSavedMovies())
    setStats(getStats())
  }, [])

  function handleLogin() {
    if (adminEmail.toLowerCase() === ADMIN_EMAIL && pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]: name === 'year' || name === 'price' || name === 'rating' ? Number(value) : value,
    }))
  }

  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.checked }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!cloudName || !uploadPreset) {
      setUploadError('Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your secrets.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadProgress(0)

    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', uploadPreset)
    data.append('resource_type', 'video')

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`)

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setUploadProgress(Math.round((ev.loaded / ev.total) * 100))
        }
      }

      xhr.onload = () => {
        setUploading(false)
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText)
          setForm((f) => ({ ...f, videoUrl: res.secure_url }))
          setUploadProgress(100)
        } else {
          setUploadError('Upload failed. Check your Cloudinary credentials.')
        }
        resolve()
      }

      xhr.onerror = () => {
        setUploading(false)
        setUploadError('Upload failed. Please try again.')
        resolve()
      }

      xhr.send(data)
    })
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
    const updated = getSavedMovies()
    setMovies(updated)
    setStats(getStats())
    setForm(emptyForm)
    setEditingId(null)
    setUploadProgress(0)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setActiveTab('movies')
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
        <div className="bg-[#111] border border-[#222] p-8 rounded-2xl w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-2 text-green-500">Admin Login</h1>
          <p className="text-gray-500 text-sm mb-6">9JA STREAM Admin Panel</p>
          <input
            type="email"
            placeholder="Admin email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full p-3 rounded-lg bg-[#222] mb-3 text-white outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Admin password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full p-3 rounded-lg bg-[#222] mb-3 text-white outline-none focus:ring-2 focus:ring-green-500"
          />
          {pwError && (
            <p className="text-red-400 text-sm mb-3 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              Incorrect email or password.
            </p>
          )}
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

  const totalAllMovies = movies.length + MOCK_MOVIES.length

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-500">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">{ADMIN_EMAIL}</p>
        </div>
        <button
          onClick={() => setStats(getStats())}
          className="text-xs bg-[#222] hover:bg-[#2a2a2a] px-3 py-2 rounded-lg text-gray-400 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-[#222] pb-0">
        {(['dashboard', 'upload', 'movies'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-[#111] border border-b-[#111] border-[#222] text-green-400 -mb-px'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'upload' ? 'Add Movie' : tab === 'movies' ? `Movies (${movies.length})` : tab}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Registered Users', value: stats.totalUsers, color: 'text-green-400', icon: '👤' },
              { label: 'Total Movies', value: totalAllMovies, color: 'text-blue-400', icon: '🎬' },
              { label: 'Uploaded Movies', value: stats.totalMovies, color: 'text-purple-400', icon: '☁️' },
              { label: 'Paid Purchases', value: stats.totalPurchases, color: 'text-yellow-400', icon: '💳' },
            ].map((s) => (
              <div key={s.label} className="bg-[#111] border border-[#222] rounded-2xl p-5">
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111] border border-[#222] rounded-2xl p-5">
              <p className="text-sm text-gray-400 mb-3 font-medium">Movie Breakdown</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Free movies</span>
                  <span className="text-white font-medium">{stats.freeMovies + MOCK_MOVIES.filter(m => m.access !== 'paid').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Paid movies</span>
                  <span className="text-yellow-400 font-medium">{stats.paidMovies + MOCK_MOVIES.filter(m => m.access === 'paid').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Paying users</span>
                  <span className="text-green-400 font-medium">{stats.payingUsers}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-[#111] border border-[#222] rounded-2xl p-5">
              <p className="text-sm text-gray-400 mb-3 font-medium">Registered Users</p>
              {stats.userList.length === 0 ? (
                <p className="text-gray-600 text-sm">No users have signed up yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stats.userList.map((u) => (
                    <div key={u.email} className="flex items-center gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                      <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-3 rounded-xl text-sm font-semibold"
            >
              + Add New Movie
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className="bg-[#111] border border-[#222] hover:bg-[#1a1a1a] transition-colors px-6 py-3 rounded-xl text-sm"
            >
              Manage Movies
            </button>
          </div>
        </div>
      )}

      {/* ── ADD MOVIE TAB ── */}
      {activeTab === 'upload' && (
      <>
      {!cloudName && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6 text-sm text-yellow-300">
          <strong>Direct upload not configured.</strong> To enable uploading video files from your computer, add{' '}
          <code className="bg-black/30 px-1 rounded">VITE_CLOUDINARY_CLOUD_NAME</code> and{' '}
          <code className="bg-black/30 px-1 rounded">VITE_CLOUDINARY_UPLOAD_PRESET</code> to your Replit Secrets.
          You can still paste Google Drive or Dropbox links below.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-10 space-y-4">
        <h2 className="text-xl font-semibold mb-2">
          {editingId ? 'Edit Movie' : 'Add New Movie'}
        </h2>

        {/* ── TMDB Auto-fill ── */}
        <div className="bg-[#0d0d0d] border border-green-900 rounded-2xl p-4">
          <p className="text-sm font-semibold text-green-400 mb-3">
            ✨ Auto-Fill from Movie Database
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={tmdbQuery}
              onChange={(e) => setTmdbQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchTmdb())}
              placeholder="Search any movie name e.g. King of Boys, Black Panther…"
              className="flex-1 p-3 rounded-lg bg-[#1a1a1a] text-white outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <button
              type="button"
              onClick={searchTmdb}
              disabled={tmdbSearching}
              className="bg-green-600 hover:bg-green-700 transition-colors px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 shrink-0"
            >
              {tmdbSearching ? 'Searching…' : 'Search'}
            </button>
          </div>

          {tmdbError && (
            <p className="text-red-400 text-xs mt-2">{tmdbError}</p>
          )}

          {!TMDB_KEY && (
            <p className="text-yellow-500 text-xs mt-2">
              Add <code className="bg-black/30 px-1 rounded">VITE_TMDB_API_KEY</code> to your Secrets to enable this feature.
            </p>
          )}

          {tmdbResults.length > 0 && (
            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
              {tmdbResults.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => fillFromTmdb(m)}
                  className="w-full flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] hover:border-green-700 rounded-xl p-3 text-left transition-all"
                >
                  {m.poster_path ? (
                    <img
                      src={`${TMDB_IMG}${m.poster_path}`}
                      alt={m.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-[#333] rounded-lg shrink-0 flex items-center justify-center text-lg">🎬</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">
                      {m.release_date?.slice(0, 4)} · ⭐ {m.vote_average?.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{m.overview?.slice(0, 80)}…</p>
                  </div>
                  <span className="text-green-500 text-xs shrink-0 font-medium ml-auto">Use →</span>
                </button>
              ))}
            </div>
          )}
        </div>

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
          <label className="text-sm text-gray-400 mb-1 block">Backdrop Image URL (optional)</label>
          <input name="backdropUrl" value={form.backdropUrl} onChange={handleChange}
            placeholder="https://... (wide banner image, uses poster if blank)"
            className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        {/* Video section */}
        <div className="border border-[#2a2a2a] rounded-xl p-4">
          <label className="text-sm text-gray-300 font-medium mb-3 block">Video Source *</label>

          <div className="flex gap-2 mb-4">
            <button type="button"
              onClick={() => setUploadMode('file')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadMode === 'file' ? 'bg-green-600 text-white' : 'bg-[#222] text-gray-400 hover:bg-[#2a2a2a]'}`}>
              Upload File
            </button>
            <button type="button"
              onClick={() => setUploadMode('link')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadMode === 'link' ? 'bg-green-600 text-white' : 'bg-[#222] text-gray-400 hover:bg-[#2a2a2a]'}`}>
              Paste Link
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#333] hover:border-green-600 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                {uploading ? (
                  <div>
                    <p className="text-gray-300 mb-3">Uploading... {uploadProgress}%</p>
                    <div className="w-full bg-[#222] rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : form.videoUrl && uploadProgress === 100 ? (
                  <div>
                    <p className="text-green-400 font-medium mb-1">Upload complete!</p>
                    <p className="text-xs text-gray-500 truncate">{form.videoUrl}</p>
                    <p className="text-xs text-gray-500 mt-2">Click to upload a different file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-4xl mb-3">🎬</p>
                    <p className="text-gray-300 font-medium mb-1">Click to select a video file</p>
                    <p className="text-xs text-gray-500">MP4, MKV, AVI, MOV supported</p>
                    {!cloudName && (
                      <p className="text-xs text-yellow-500 mt-2">Configure Cloudinary to enable direct uploads</p>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={!cloudName}
              />
              {uploadError && <p className="text-red-400 text-sm mt-2">{uploadError}</p>}
            </div>
          ) : (
            <div>
              <input name="videoUrl" value={form.videoUrl} onChange={handleChange}
                placeholder="https://drive.google.com/file/d/... or https://www.dropbox.com/..."
                className="w-full p-3 rounded-lg bg-[#222] text-white outline-none focus:ring-2 focus:ring-green-500" />
              <p className="text-xs text-gray-500 mt-2">
                Google Drive: set sharing to "Anyone with the link". Dropbox: use the share link ending in ?dl=0
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-gray-400">
            All movies are <span className="text-white font-medium">free with ads</span>. Users pay <span className="text-yellow-400 font-bold">₦200</span> per movie to skip ads.
          </div>

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
          <button type="submit" disabled={uploading}
            className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-3 rounded-xl font-semibold disabled:opacity-50">
            {editingId ? 'Update Movie' : 'Add Movie'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null) }}
              className="bg-[#222] hover:bg-[#333] transition-colors px-8 py-3 rounded-xl">
              Cancel
            </button>
          )}
          {saved && <span className="text-green-400 self-center text-sm">Saved!</span>}
        </div>
      </form>
      </>
      )}

      {/* ── MOVIES TAB ── */}
      {activeTab === 'movies' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Uploaded Movies ({movies.length})</h2>
            <button
              onClick={() => setActiveTab('upload')}
              className="text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              + Add Movie
            </button>
          </div>

          {movies.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎬</p>
              <p className="text-gray-500 mb-4">No movies uploaded yet.</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Upload Your First Movie
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {movies.map((m) => (
                <div key={m.id} className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-xl p-4">
                  {m.posterUrl ? (
                    <img src={m.posterUrl} alt={m.title} className="w-14 h-20 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-14 h-20 bg-[#222] rounded-lg shrink-0 flex items-center justify-center text-2xl">🎬</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{m.title}</p>
                    <p className="text-sm text-gray-400">{m.year} · {m.category}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.access === 'paid' ? `Paid — ₦${m.price}` : 'Free with ads'}
                    </p>
                    {m.videoUrl && (
                      <p className="text-xs text-green-600 mt-1">
                        {m.videoUrl.includes('drive.google') ? '📁 Google Drive'
                          : m.videoUrl.includes('dropbox') ? '📦 Dropbox'
                          : m.videoUrl.includes('cloudinary') ? '☁️ Cloudinary (uploaded)'
                          : '🎬 Direct link'}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => { handleEdit(m); setActiveTab('upload') }}
                      className="text-xs bg-[#222] hover:bg-[#333] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-xs bg-red-900/40 hover:bg-red-900/70 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
