import React from 'react'
import { MOCK_MOVIES } from '../data/mockData'
import { MovieCard } from '../components/movie/MovieCard'

export function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Trending Movies
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {MOCK_MOVIES.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
