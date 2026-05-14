import React from 'react'
import { Link } from 'react-router-dom'

export function MovieCard({ movie }: any) {
  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="bg-[#111] rounded-xl overflow-hidden hover:scale-105 transition-transform">
        <img
          src={movie.posterUrl}
          className="w-full h-[300px] object-cover"
        />

        <div className="p-3">
          <h3 className="font-semibold">{movie.title}</h3>

          {movie.access === 'paid' ? (
            <span className="text-yellow-400 text-sm">
              ₦{movie.price} Ad-Free
            </span>
          ) : (
            <span className="text-green-400 text-sm">
              Free With Ads
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
