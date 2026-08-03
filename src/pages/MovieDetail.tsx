import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'
import { getAllMovies, isMoviePaid, markMoviePaid, getReviews, addReview, deleteReview, hasUserReviewed, Review } from '../utils/storage'
import { Movie } from '../types'
import { useAuth } from '../context/AuthContext'

const AD_FREE_PRICE = 200

declare global {
  interface Window { PaystackPop: any }
}

function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'} ${
            star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-600'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function timeAgo(ts: number | string | undefined): string {
  if (!ts) return ''
  const time = typeof ts === 'string' ? new Date(ts).getTime() : ts
  const diff = Date.now() - time
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function MovieDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [paid, setPaid] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')

  const [reviews, setReviews] = useState<Review[]>([])
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const all = await getAllMovies(MOCK_MOVIES)
      const found = all.find((m) => m.id === id) || null
      setMovie(found)
      if (found && user?.email) {
        const [paidStatus, reviewed, reviewList] = await Promise.all([
          isMoviePaid(found.id, user.email),
          hasUserReviewed(found.id, user.email),
          getReviews(found.id),
        ])
        setPaid(paidStatus)
        setAlreadyReviewed(reviewed)
        setReviews(reviewList)
      } else if (found) {
        const reviewList = await getReviews(found.id)
        setReviews(reviewList)
      }
    }
    load()
  }, [id, user])

  async function refreshReviews() {
    if (id) {
      const reviewList = await getReviews(id)
      setReviews(reviewList)
    }
  }

  function handlePaystack() {
    if (!user?.email) {
      navigate('/login')
      return
    }
    if (!movie) return
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPayError('Payment is not available yet. Please watch free with ads for now.')
      return
    }
    setPayLoading(true)
    setPayError('')
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: user.email,
      amount: AD_FREE_PRICE * 100,
      currency: 'NGN',
      ref: `adFree_${movie.id}_${Date.now()}`,
      metadata: { movieId: movie.id, movieTitle: movie.title },
      onClose() { setPayLoading(false) },
      async callback() {
        await markMoviePaid(movie.id, user.email)
        setPaid(true)
        setPayLoading(false)
        navigate(`/player/${movie.id}`)
      },
    })
    handler.openIframe()
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    setReviewError('')
    if (!user) { setReviewError('You must be logged in to leave a review.'); return }
    if (rating === 0) { setReviewError('Please select a star rating.'); return }
    if (comment.trim().length < 5) { setReviewError('Please write at least a short comment.'); return }
    await addReview({
      movieId: id!,
      userEmail: user.email,
      userName: user.name || user.email.split('@')[0],
      rating,
      comment: comment.trim(),
      timestamp: Date.now(),
    })
    setAlreadyReviewed(true)
    setReviewSuccess(true)
    setRating(0)
    setComment('')
    await refreshReviews()
  }

  async function handleDeleteReview(reviewId: string) {
    await deleteReview(reviewId)
    await refreshReviews()
    if (user?.email && id) {
      const reviewed = await hasUserReviewed(id, user.email)
      setAlreadyReviewed(reviewed)
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (!movie) return (
    <div className="p-6 text-center text-gray-400 mt-20">Movie not found.</div>
  )

  const hasVideo = !!movie.videoUrl

  return (
    <>
      {payLoading && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Opening payment…</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Backdrop */}
        {movie.backdropUrl && (
          <div className="relative w-full h-48 md:h-72 rounded-2xl overflow-hidden mb-6">
            <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        )}

        {/* Info */}
        <div className="flex gap-6 mb-8">
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-28 md:w-40 rounded-xl object-cover shrink-0 -mt-16 relative z-10 shadow-xl"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-3">
              {movie.year && <span>{movie.year}</span>}
              {movie.category && <span>· {movie.category}</span>}
              {movie.rating !== undefined && movie.rating > 0 && (
                <span>· ⭐ {movie.rating}</span>
              )}
              {avgRating && <span>· 👥 {avgRating}/5</span>}
            </div>
            {(movie.genres || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {(movie.genres || []).map((g) => (
                  <span key={g} className="text-xs bg-[#222] px-2 py-0.5 rounded-full text-gray-400">{g}</span>
                ))}
              </div>
            )}
            <p className="text-gray-300 text-sm leading-relaxed">{movie.synopsis}</p>
          </div>
        </div>

        {/* Cast */}
        {(movie.cast || []).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Cast</h2>
            <p className="text-gray-400 text-sm">{(movie.cast || []).join(', ')}</p>
          </div>
        )}

        {/* Watch options */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-semibold mb-4">Watch Options</h2>
          {!hasVideo ? (
            <p className="text-gray-500 text-sm">No video available yet. Check back soon.</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/player/${movie.id}`}
                className="flex-1 text-center bg-[#1a1a1a] border border-[#333] hover:bg-[#222] transition-colors px-5 py-3 rounded-xl font-medium"
              >
                📺 Watch Free
                <span className="block text-xs text-gray-500 mt-0.5">Short ad before movie</span>
              </Link>
              {paid ? (
                <Link
                  to={`/player/${movie.id}`}
                  className="flex-1 text-center bg-green-700 hover:bg-green-600 transition-colors px-5 py-3 rounded-xl font-medium"
                >
                  ✓ Watch Ad-Free
                  <span className="block text-xs text-green-300 mt-0.5">Already unlocked</span>
                </Link>
              ) : (
                <button
                  onClick={handlePaystack}
                  className="flex-1 text-center bg-yellow-600 hover:bg-yellow-700 transition-colors px-5 py-3 rounded-xl font-medium"
                >
                  ⚡ Pay ₦{AD_FREE_PRICE} — Watch Ad-Free
                  <span className="block text-xs text-yellow-200 mt-0.5">One-time payment</span>
                </button>
              )}
            </div>
          )}
          {payError && (
            <p className="text-red-400 text-sm mt-3">{payError}</p>
          )}
          {!user && (
            <p className="text-gray-500 text-xs mt-3">
              <Link to="/login" className="text-green-400 hover:underline">Log in</Link> to purchase
            </p>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-xl font-bold mb-6">
            Reviews
            {reviews.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-400">({reviews.length})</span>
            )}
          </h2>

          {/* Submit review */}
          {user && !alreadyReviewed && (
            <form onSubmit={handleSubmitReview} className="bg-[#111] border border-[#222] rounded-2xl p-5 mb-6">
              <h3 className="font-semibold mb-3">Write a Review</h3>
              <div className="mb-3">
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                rows={3}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm text-white outline-none focus:border-green-500 resize-none"
              />
              {reviewError && <p className="text-red-400 text-xs mt-2">{reviewError}</p>}
              {reviewSuccess && <p className="text-green-400 text-xs mt-2">Review posted!</p>}
              <button
                type="submit"
                className="mt-3 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                Post Review
              </button>
            </form>
          )}

          {!user && (
            <p className="text-gray-500 text-sm mb-6">
              <Link to="/login" className="text-green-400 hover:underline">Log in</Link> to leave a review.
            </p>
          )}

          {alreadyReviewed && (
            <div className="bg-green-900/20 border border-green-800/40 rounded-xl px-4 py-3 mb-6 text-sm text-green-400">
              ✓ You've already reviewed this movie.
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#111] border border-[#222] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-sm font-bold shrink-0">
                        {(review.userName || review.userEmail || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.userName || review.userEmail.split('@')[0]}</p>
                        <p className="text-xs text-gray-500">{timeAgo(review.created_at || review.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} readonly />
                      {user?.email === review.userEmail && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
                          title="Delete review"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
