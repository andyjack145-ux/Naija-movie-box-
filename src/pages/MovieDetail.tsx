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

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
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
    const all = getAllMovies(MOCK_MOVIES)
    const found = all.find((m) => m.id === id) || null
    setMovie(found)
    if (found && user?.email) {
      setPaid(isMoviePaid(found.id, user.email))
      setAlreadyReviewed(hasUserReviewed(found.id, user.email))
    }
    if (found) {
      setReviews(getReviews(found.id))
    }
  }, [id, user])

  function refreshReviews() {
    if (id) setReviews(getReviews(id))
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
      callback() {
        markMoviePaid(movie.id, user.email)
        setPaid(true)
        setPayLoading(false)
        navigate(`/player/${movie.id}`)
      },
    })
    handler.openIframe()
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    setReviewError('')
    if (!user) { setReviewError('You must be logged in to leave a review.'); return }
    if (rating === 0) { setReviewError('Please select a star rating.'); return }
    if (comment.trim().length < 5) { setReviewError('Please write at least a short comment.'); return }
    addReview({
      movieId: id!,
      userEmail: user.email,
      userName: user.name || user.email.split('@')[0],
      rating,
      comment: comment.trim(),
    })
    setAlreadyReviewed(true)
    setReviewSuccess(true)
    setRating(0)
    setComment('')
    refreshReviews()
  }

  function handleDeleteReview(reviewId: string) {
    deleteReview(reviewId)
    refreshReviews()
    if (user?.email && id) setAlreadyReviewed(hasUserReviewed(id, user.email))
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', background: 'rgba(0,0,0,0.65)' }}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-10 flex flex-col items-center gap-5 shadow-2xl max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 rounded-full border-4 border-[#2a2a2a] border-t-green-500 animate-spin" />
            <div>
              <p className="text-xl font-bold mb-1">Opening Payment</p>
              <p className="text-gray-400 text-sm">Secure checkout is loading…</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl px-5 py-3 w-full">
              <p className="text-gray-500 text-xs mb-1">You are paying</p>
              <p className="text-3xl font-black text-yellow-400">₦{AD_FREE_PRICE}</p>
              <p className="text-gray-500 text-xs mt-1">One-time · Ad-free for <span className="text-white">{movie.title}</span></p>
            </div>
            <button onClick={() => setPayLoading(false)} className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="p-6 max-w-4xl mx-auto">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          className="w-full h-[400px] object-cover rounded-2xl mb-6"
          alt={movie.title}
        />

        <div className="flex flex-wrap gap-2 mb-3">
          {movie.isTrending && (
            <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">Trending</span>
          )}
          {movie.isNewRelease && (
            <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">New Release</span>
          )}
          {movie.category && (
            <span className="bg-[#222] text-gray-300 text-xs px-2 py-1 rounded-full">{movie.category}</span>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
          {movie.year && <span>{movie.year}</span>}
          {movie.duration && <span>{movie.duration}</span>}
          {movie.rating && <span>⭐ {movie.rating}/10</span>}
          {avgRating && (
            <span className="text-yellow-400">★ {avgRating}/5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          )}
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.map((g) => (
              <span key={g} className="bg-[#1a1a1a] border border-[#333] text-sm px-3 py-1 rounded-full">{g}</span>
            ))}
          </div>
        )}

        <p className="text-gray-300 mb-6 leading-relaxed">{movie.synopsis}</p>

        {movie.cast && movie.cast.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-1 text-gray-400 text-sm uppercase tracking-wide">Cast</h3>
            <p className="text-gray-300">{movie.cast.join(', ')}</p>
          </div>
        )}

        {/* Watch options */}
        {!hasVideo ? (
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-center text-gray-500">
            Video coming soon
          </div>
        ) : paid ? (
          <div className="bg-[#111] border border-green-800 rounded-2xl p-6">
            <p className="text-green-400 font-semibold mb-1">✓ You own the ad-free version</p>
            <p className="text-gray-400 text-sm mb-4">Enjoy watching without any interruptions.</p>
            <Link
              to={`/player/${movie.id}`}
              className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-3 rounded-xl font-semibold inline-block"
            >
              Watch Now (Ad-Free)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col">
              <div className="mb-4 flex-1">
                <p className="font-bold text-lg mb-1">Watch Free</p>
                <p className="text-gray-400 text-sm">Short ad before the movie starts. No payment needed.</p>
              </div>
              <Link
                to={`/player/${movie.id}`}
                className="bg-[#1a1a1a] border border-[#333] hover:bg-[#222] transition-colors px-6 py-3 rounded-xl text-center font-medium"
              >
                Watch with Ads
              </Link>
            </div>

            <div className="bg-[#111] border border-yellow-700 rounded-2xl p-6 flex flex-col">
              <div className="mb-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-lg">Ad-Free</p>
                  <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">₦{AD_FREE_PRICE}</span>
                </div>
                <p className="text-gray-400 text-sm">Pay once, watch this movie ad-free anytime. One-time purchase.</p>
              </div>
              <button
                onClick={handlePaystack}
                disabled={payLoading}
                className="bg-yellow-600 hover:bg-yellow-700 transition-colors px-6 py-3 rounded-xl font-semibold disabled:opacity-60"
              >
                {payLoading ? 'Opening payment…' : `Pay ₦${AD_FREE_PRICE} & Watch`}
              </button>
              {payError && <p className="text-red-400 text-xs mt-2">{payError}</p>}
              {!user && (
                <p className="text-gray-500 text-xs mt-2 text-center">
                  <Link to="/login" className="text-green-400 hover:underline">Log in</Link> to purchase
                </p>
              )}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-base font-normal text-gray-400">({reviews.length})</span>
              )}
            </h2>
            {avgRating && (
              <div className="flex items-center gap-2 bg-[#111] border border-[#222] rounded-xl px-4 py-2">
                <span className="text-yellow-400 text-xl font-bold">{avgRating}</span>
                <StarRating value={Math.round(Number(avgRating))} readonly />
              </div>
            )}
          </div>

          {/* Write a review */}
          {!user ? (
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-center mb-6">
              <p className="text-gray-400 mb-3">Want to leave a review?</p>
              <Link to="/login" className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-2 rounded-xl font-semibold inline-block text-sm">
                Log in to Review
              </Link>
            </div>
          ) : alreadyReviewed && !reviewSuccess ? (
            <div className="bg-[#111] border border-[#222] rounded-2xl p-4 text-center text-gray-400 text-sm mb-6">
              ✓ You have already reviewed this movie
            </div>
          ) : !alreadyReviewed ? (
            <form onSubmit={handleSubmitReview} className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-6">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Your Rating</p>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                rows={3}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-green-600 transition-colors"
              />
              {reviewError && <p className="text-red-400 text-xs mt-2">{reviewError}</p>}
              <button
                type="submit"
                className="mt-3 bg-green-600 hover:bg-green-700 transition-colors px-6 py-2 rounded-xl font-semibold text-sm"
              >
                Post Review
              </button>
            </form>
          ) : null}

          {reviewSuccess && (
            <div className="bg-green-900/30 border border-green-700 rounded-2xl p-4 text-center text-green-400 text-sm mb-6">
              ✓ Your review has been posted!
            </div>
          )}

          {/* Review list */}
          {reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-[#111] border border-[#222] rounded-2xl">
              No reviews yet. Be the first to review this movie!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-[#111] border border-[#222] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-800 flex items-center justify-center text-sm font-bold uppercase">
                        {r.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.userName}</p>
                        <p className="text-gray-500 text-xs">{timeAgo(r.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating value={r.rating} readonly />
                      {user?.email === r.userEmail && (
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                          title="Delete your review"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
