import React, { useState } from 'react'
import { MOCK_MOVIES } from '../data/mockData'
import { MovieCard } from '../components/movie/MovieCard'

export function Search() {
  const [query, setQuery] = useState('')

  const filteredMovies = MOCK_MOVIES.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="p-6">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies"
        className="w-full bg-[#111] border border-[#222] p-4 rounded-2xl mb-8"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
