import { supabase } from './supabase'
import { Movie } from '../types'

const MOVIES_KEY = 'naija_stream_movies'
const PAID_KEY = 'naija_stream_paid'
const REVIEWS_KEY = 'naija_stream_reviews'
const WATCHLIST_KEY = 'naija_stream_watchlist'
const SUBMISSIONS_KEY = 'naija_stream_submissions'

/* ================= TYPES ================= */

export type Review = {
  id: string
  movieId: string
  userEmail: string
  userName: string
  rating: number
  comment: string
  timestamp?: number
  created_at?: string
}

/* ================= LOCAL HELPERS ================= */

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

/* ================= MOVIES ================= */

export async function getSavedMovies(): Promise<Movie[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) return data || []
  }
  return lsGet<Movie[]>(MOVIES_KEY, [])
}

export async function getAllMovies(fallback: Movie[]): Promise<Movie[]> {
  const saved = await getSavedMovies()
  if (saved.length > 0) return saved
  return fallback
}

export async function saveMovie(movie: Movie) {
  if (supabase) {
    const { error } = await supabase.from('movies').upsert(movie)
    if (!error) return
  }
  const movies = lsGet<Movie[]>(MOVIES_KEY, [])
  const idx = movies.findIndex((m) => m.id === movie.id)
  if (idx >= 0) movies[idx] = movie
  else movies.unshift(movie)
  lsSet(MOVIES_KEY, movies)
}

export async function deleteMovie(id: string) {
  if (supabase) {
    await supabase.from('movies').delete().eq('id', id)
    return
  }
  const movies = lsGet<Movie[]>(MOVIES_KEY, [])
  lsSet(MOVIES_KEY, movies.filter((m) => m.id !== id))
}

/* ================= REVIEWS ================= */

export async function getReviews(movieId: string): Promise<Review[]> {
  if (supabase) {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('movieId', movieId)
      .order('created_at', { ascending: false })
    return (data as Review[]) || []
  }
  return lsGet<Review[]>(REVIEWS_KEY, []).filter((r) => r.movieId === movieId)
}

export async function addReview(review: Omit<Review, 'id'>) {
  if (supabase) {
    await supabase.from('reviews').insert([review])
    return
  }
  const reviews = lsGet<Review[]>(REVIEWS_KEY, [])
  reviews.unshift({ ...review, id: `r_${Date.now()}` })
  lsSet(REVIEWS_KEY, reviews)
}

export async function deleteReview(id: string) {
  if (supabase) {
    await supabase.from('reviews').delete().eq('id', id)
    return
  }
  const reviews = lsGet<Review[]>(REVIEWS_KEY, [])
  lsSet(REVIEWS_KEY, reviews.filter((r) => r.id !== id))
}

export async function hasUserReviewed(movieId: string, email: string): Promise<boolean> {
  if (supabase) {
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('movieId', movieId)
      .eq('userEmail', email)
    return (data?.length || 0) > 0
  }
  return lsGet<Review[]>(REVIEWS_KEY, []).some(
    (r) => r.movieId === movieId && r.userEmail === email
  )
}

/* ================= WATCHLIST ================= */

export async function getWatchlist(email: string): Promise<string[]> {
  if (supabase) {
    const { data } = await supabase
      .from('watchlist')
      .select('*')
      .eq('email', email)
    return data?.map((w: any) => w.movieId) || []
  }
  const all = lsGet<{ movieId: string; email: string }[]>(WATCHLIST_KEY, [])
  return all.filter((w) => w.email === email).map((w) => w.movieId)
}

export async function addToWatchlist(movieId: string, email: string) {
  if (supabase) {
    await supabase.from('watchlist').insert([{ movieId, email }])
    return
  }
  const all = lsGet<{ movieId: string; email: string }[]>(WATCHLIST_KEY, [])
  if (!all.some((w) => w.movieId === movieId && w.email === email)) {
    all.push({ movieId, email })
    lsSet(WATCHLIST_KEY, all)
  }
}

export async function removeFromWatchlist(movieId: string, email: string) {
  if (supabase) {
    await supabase.from('watchlist').delete().eq('movieId', movieId).eq('email', email)
    return
  }
  const all = lsGet<{ movieId: string; email: string }[]>(WATCHLIST_KEY, [])
  lsSet(WATCHLIST_KEY, all.filter((w) => !(w.movieId === movieId && w.email === email)))
}

export async function isInWatchlist(movieId: string, email: string): Promise<boolean> {
  if (supabase) {
    const { data } = await supabase
      .from('watchlist')
      .select('id')
      .eq('movieId', movieId)
      .eq('email', email)
    return (data?.length || 0) > 0
  }
  const all = lsGet<{ movieId: string; email: string }[]>(WATCHLIST_KEY, [])
  return all.some((w) => w.movieId === movieId && w.email === email)
}

/* ================= PAYMENTS ================= */

export async function markMoviePaid(movieId: string, email: string) {
  if (supabase) {
    await supabase.from('payments').insert([{ movieId, email }])
    return
  }
  const paid = lsGet<{ movieId: string; email: string }[]>(PAID_KEY, [])
  if (!paid.some((p) => p.movieId === movieId && p.email === email)) {
    paid.push({ movieId, email })
    lsSet(PAID_KEY, paid)
  }
}

export async function isMoviePaid(movieId: string, email: string): Promise<boolean> {
  if (supabase) {
    const { data } = await supabase
      .from('payments')
      .select('id')
      .eq('movieId', movieId)
      .eq('email', email)
    return (data?.length || 0) > 0
  }
  return lsGet<{ movieId: string; email: string }[]>(PAID_KEY, []).some(
    (p) => p.movieId === movieId && p.email === email
  )
}

export async function getPaidMovieIds(email: string): Promise<string[]> {
  if (supabase) {
    const { data } = await supabase
      .from('payments')
      .select('movieId')
      .eq('email', email)
    return data?.map((p: any) => p.movieId) || []
  }
  return lsGet<{ movieId: string; email: string }[]>(PAID_KEY, [])
    .filter((p) => p.email === email)
    .map((p) => p.movieId)
}

/* ================= SUBMISSIONS ================= */

export async function addPendingSubmission(submission: any) {
  if (supabase) {
    await supabase.from('submissions').insert([submission])
    return
  }
  const subs = lsGet<any[]>(SUBMISSIONS_KEY, [])
  subs.unshift({ ...submission, id: `sub_${Date.now()}` })
  lsSet(SUBMISSIONS_KEY, subs)
}

export async function getPendingSubmissions() {
  if (supabase) {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }
  return lsGet<any[]>(SUBMISSIONS_KEY, [])
}
