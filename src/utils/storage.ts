import { Movie } from '../types'

const MOVIES_KEY = 'naija_stream_movies'
const PAID_KEY = 'naija_stream_paid'

export function getSavedMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(MOVIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveMovie(movie: Movie): void {
  const movies = getSavedMovies()
  const idx = movies.findIndex((m) => m.id === movie.id)
  if (idx >= 0) {
    movies[idx] = movie
  } else {
    movies.push(movie)
  }
  localStorage.setItem(MOVIES_KEY, JSON.stringify(movies))
}

export function deleteMovie(id: string): void {
  const movies = getSavedMovies().filter((m) => m.id !== id)
  localStorage.setItem(MOVIES_KEY, JSON.stringify(movies))
}

export function getAllMovies(mockMovies: Movie[]): Movie[] {
  const saved = getSavedMovies()
  const savedIds = new Set(saved.map((m) => m.id))
  const filtered = mockMovies.filter((m) => !savedIds.has(m.id))
  return [...saved, ...filtered]
}

export function markMoviePaid(movieId: string, email: string): void {
  try {
    const raw = localStorage.getItem(PAID_KEY)
    const paid: Record<string, string[]> = raw ? JSON.parse(raw) : {}
    if (!paid[email]) paid[email] = []
    if (!paid[email].includes(movieId)) paid[email].push(movieId)
    localStorage.setItem(PAID_KEY, JSON.stringify(paid))
  } catch {}
}

export function isMoviePaid(movieId: string, email: string): boolean {
  try {
    const raw = localStorage.getItem(PAID_KEY)
    if (!raw) return false
    const paid: Record<string, string[]> = JSON.parse(raw)
    return (paid[email] || []).includes(movieId)
  } catch {
    return false
  }
}
