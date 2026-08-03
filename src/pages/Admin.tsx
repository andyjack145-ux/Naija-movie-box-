import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { getSavedMovies, deleteMovie } from '../utils/storage'
import { Movie } from '../types'

const ADMIN_EMAIL = 'andyntuk@gmail.com'
const ADMIN_PASSWORD = '12345678'

const emptyForm = {
  title: '',
  year: new Date().getFullYear(),
  rating: 7,
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
  const [movies, setMovies] = useState<Movie[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')

  // LOGIN
  function login() {
    if (email === ADMIN_EMAIL && pw === ADMIN_PASSWORD) {
      setAuthed(true)
    }
  }

  // LOAD MOVIES
  async function loadMovies() {
    const data = await getSavedMovies()
    setMovies(data)
  }

  useEffect(() => {
    loadMovies()
  }, [])

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // SAVE MOVIE (CREATE + UPDATE)
  async function handleSubmit(e: any) {
    e.preventDefault()

    const movie: Movie = {
      id: editingId || crypto.randomUUID(),
      title: form.title,
      year: form.year,
      rating: form.rating,
      duration: form.duration,
      genres: form.genres.split(',').map(g => g.trim()),
      synopsis: form.synopsis,
      cast: form.cast.split(',').map(c => c.trim()),
      posterUrl: form.posterUrl,
      backdropUrl: form.backdropUrl || form.posterUrl,
      category: form.category,
      videoUrl: form.videoUrl,
      access: form.access,
      price: form.access === 'paid' ? form.price : undefined,
      isTrending: form.isTrending,
      isNewRelease: form.isNewRelease,
    }

    await supabase.from('movies').upsert(movie)

    await loadMovies()

    setForm(emptyForm)
    setEditingId(null)
  }

  function editMovie(m: Movie) {
    setForm({
      title: m.title,
      year: m.year,
      rating: m.rating,
      duration: m.duration || '',
      genres: m.genres?.join(', ') || '',
      synopsis: m.synopsis,
      cast: m.cast?.join(', ') || '',
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl || '',
      category: m.category || 'Nollywood',
      videoUrl: m.videoUrl || '',
      access: m.access || 'free',
      price: m.price || 200,
      isTrending: m.isTrending || false,
      isNewRelease: m.isNewRelease || false,
    })
    setEditingId(m.id)
  }

  async function remove(id: string) {
    await deleteMovie(id)
    await loadMovies()
  }

  if (!authed) {
    return (
      <div>
        <input placeholder="email" onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" onChange={e => setPw(e.target.value)} />
        <button onClick={login}>Login</button>
      </div>
    )
  }

  return (
    <div>
      <h1>Admin Panel</h1>

      <form onSubmit={handleSubmit}>
        <input name="title" onChange={handleChange} value={form.title} placeholder="Title" />
        <input name="posterUrl" onChange={handleChange} value={form.posterUrl} placeholder="Poster" />
        <input name="videoUrl" onChange={handleChange} value={form.videoUrl} placeholder="Video URL" />

        <button type="submit">
          {editingId ? 'Update' : 'Add'} Movie
        </button>
      </form>

      <div>
        {movies.map(m => (
          <div key={m.id}>
            <h3>{m.title}</h3>
            <button onClick={() => editMovie(m)}>Edit</button>
            <button onClick={() => remove(m.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
        }
