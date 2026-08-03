import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MOCK_MOVIES } from '../data/mockData'
import { getAllMovies } from '../utils/storage'
import { MovieCard } from '../components/movie/MovieCard'
import { Movie } from '../types'

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [movies, setMovies] = useState<Movie[]>([])

  useEffect(() => {
    getAllMovies(MOCK_MOVIES).then(setMovies)
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setQuery(q)
  }, [searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (val.trim()) {
      setSearchParams({ q: val })
    } else {
      setSearchParams({})
    }
  }

  const results = query.trim()
    ? movies.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        (m.genres || []).some((g) => g.toLowerCase().includes(query.toLowerCase())) ||
        (m.cast || []).some((c) => c.toLowerCase().includes(query.toLowerCase())) ||
        (m.category || '').toLowerCase().includes(query.toLowerCase())
      )
    : movies

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <input
        type="text"
        placeholder="Search by title, genre, cast, category..."
        value={query}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[#222] mb-6 text-white outline-none focus:ring-2 focus:ring-green-500"
        autoFocus
      />

      <p className="text-sm text-gray-500 mb-4">
        {query ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"` : `${results.length} movies`}
      </p>

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
