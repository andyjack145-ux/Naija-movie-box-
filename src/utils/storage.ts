import { Movie } from '../types'

const MOVIES_KEY = 'naija_stream_movies'
const PAID_KEY = 'naija_stream_paid'
const REVIEWS_KEY = 'naija_stream_reviews'

export interface Review {
  id: string
  movieId: string
  userEmail: string
  userName: string
  rating: number
  comment: string
  createdAt: number
}

export function getReviews(movieId: string): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    const all: Review[] = raw ? JSON.parse(raw) : []
    return all.filter((r) => r.movieId === movieId).sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

export function addReview(review: Omit<Review, 'id' | 'createdAt'>): void {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    const all: Review[] = raw ? JSON.parse(raw) : []
    all.push({ ...review, id: `${Date.now()}_${Math.random()}`, createdAt: Date.now() })
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all))
  } catch {}
}

export function deleteReview(reviewId: string): void {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    const all: Review[] = raw ? JSON.parse(raw) : []
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all.filter((r) => r.id !== reviewId)))
  } catch {}
}

export function hasUserReviewed(movieId: string, email: string): boolean {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    const all: Review[] = raw ? JSON.parse(raw) : []
    return all.some((r) => r.movieId === movieId && r.userEmail === email)
  } catch {
    return false
  }
}

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

export function getStats() {
  try {
    const usersRaw = localStorage.getItem('naija_stream_users')
    const users: Record<string, any> = usersRaw ? JSON.parse(usersRaw) : {}
    const userList = Object.entries(users).map(([email, data]: [string, any]) => ({
      email,
      name: data.name,
    }))

    const paidRaw = localStorage.getItem(PAID_KEY)
    const paid: Record<string, string[]> = paidRaw ? JSON.parse(paidRaw) : {}
    const totalPurchases = Object.values(paid).reduce((sum, arr) => sum + arr.length, 0)
    const payingUsers = Object.keys(paid).length

    const movies = getSavedMovies()

    return {
      totalUsers: userList.length,
      userList,
      totalMovies: movies.length,
      totalPurchases,
      payingUsers,
      freeMovies: movies.filter((m) => m.access !== 'paid').length,
      paidMovies: movies.filter((m) => m.access === 'paid').length,
    }
  } catch {
    return {
      totalUsers: 0,
      userList: [],
      totalMovies: 0,
      totalPurchases: 0,
      payingUsers: 0,
      freeMovies: 0,
      paidMovies: 0,
    }
  }
}
