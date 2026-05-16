import React, { useState } from 'react'
import { MOCK_MOVIES } from '../data/mockData'
import { MovieCard } from '../components/movie/MovieCard'

export function Search() {
  const [query, setQuery] = useState('')

  const results = query
    ? MOCK_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_MOVIES

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 rounded-lg bg-[#222] mb-6 text-white outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {results.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="text-gray-400 text-center mt-12">
          No movies found for "{query}"
        </p>
      )}
    </div>
  )
}
