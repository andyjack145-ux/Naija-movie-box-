import React from 'react'
import { Link } from 'react-router-dom'
import { Movie } from '../../types'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/movie/${movie.id}`} className="block group">
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-[#1a1a1a]">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <div>
            <p className="font-semibold text-sm leading-tight">{movie.title}</p>
            <p className="text-xs text-gray-400">{movie.year}</p>
          </div>
        </div>
      </div>
      <div className="mt-2 px-1">
        <p className="font-medium text-sm truncate">{movie.title}</p>
        <p className="text-xs text-gray-500">{movie.year}</p>
      </div>
    </Link>
  )
}
