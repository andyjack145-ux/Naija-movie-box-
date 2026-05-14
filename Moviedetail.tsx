import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'

export function MovieDetail() {
  const { id } = useParams()

  const movie = MOCK_MOVIES.find((m) => m.id === id)

  if (!movie) return <div>Movie not found</div>

  return (
    <div className="p-6">
      <img
        src={movie.backdropUrl}
        className="w-full h-[400px] object-cover rounded-2xl mb-6"
      />

      <h1 className="text-4xl font-bold mb-4">
        {movie.title}
      </h1>

      <p className="text-gray-400 mb-6">
        {movie.synopsis}
      </p>

      {movie.access === 'paid' ? (
        <button className="bg-yellow-600 px-6 py-3 rounded-xl">
          Pay ₦200 To Watch Ad-Free
        </button>
      ) : (
        <Link
          to={`/player/${movie.id}`}
          className="bg-green-600 px-6 py-3 rounded-xl inline-block"
        >
          Watch Free With Ads
        </Link>
      )}
    </div>
  )
}
