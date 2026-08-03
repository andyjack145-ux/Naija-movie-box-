import { supabase } from './supabase'
import { Movie } from '../types'

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

/* ================= MOVIES ================= */

export async function getSavedMovies(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
    return []
  }

  return data || []
}

export async function getAllMovies(fallback: Movie[]): Promise<Movie[]> {
  const saved = await getSavedMovies()
  if (saved.length > 0) return saved
  return fallback
}

export async function saveMovie(movie: Movie) {
  const { error } = await supabase
    .from('movies')
    .upsert(movie)

  if (error) console.log(error)
}

export async function deleteMovie(id: string) {
  await supabase.from('movies').delete().eq('id', id)
}

/* ================= REVIEWS ================= */

export async function getReviews(movieId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('movieId', movieId)
    .order('created_at', { ascending: false })

  return (data as Review[]) || []
}

export async function addReview(review: Omit<Review, 'id'>) {
  await supabase.from('reviews').insert([review])
}

export async function deleteReview(id: string) {
  await supabase.from('reviews').delete().eq('id', id)
}

export async function hasUserReviewed(movieId: string, email: string): Promise<boolean> {
  const { data } = await supabase
    .from('reviews')
    .select('id')
    .eq('movieId', movieId)
    .eq('userEmail', email)
  return (data?.length || 0) > 0
}

/* ================= WATCHLIST ================= */

export async function getWatchlist(email: string): Promise<string[]> {
  const { data } = await supabase
    .from('watchlist')
    .select('*')
    .eq('email', email)

  return data?.map((w) => w.movieId) || []
}

export async function addToWatchlist(movieId: string, email: string) {
  await supabase.from('watchlist').insert([{ movieId, email }])
}

export async function removeFromWatchlist(movieId: string, email: string) {
  await supabase
    .from('watchlist')
    .delete()
    .eq('movieId', movieId)
    .eq('email', email)
}

export async function isInWatchlist(movieId: string, email: string): Promise<boolean> {
  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('movieId', movieId)
    .eq('email', email)

  return (data?.length || 0) > 0
}

/* ================= PAYMENTS ================= */

export async function markMoviePaid(movieId: string, email: string) {
  await supabase.from('payments').insert([{ movieId, email }])
}

export async function isMoviePaid(movieId: string, email: string): Promise<boolean> {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('movieId', movieId)
    .eq('email', email)

  return (data?.length || 0) > 0
}

export async function getPaidMovieIds(email: string): Promise<string[]> {
  const { data } = await supabase
    .from('payments')
    .select('movieId')
    .eq('email', email)
  return data?.map((p: any) => p.movieId) || []
}

/* ================= SUBMISSIONS ================= */

export async function addPendingSubmission(submission: any) {
  await supabase.from('submissions').insert([submission])
}

export async function getPendingSubmissions() {
  const { data } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}
