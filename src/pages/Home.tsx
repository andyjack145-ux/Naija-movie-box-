import React, { useEffect, useState } from 'react'
import { MOCK_MOVIES } from '../data/mockData'
import { MovieCard } from '../components/movie/MovieCard'
import { HeroBanner } from '../components/movie/Herobanner'
import { getAllMovies } from '../utils/storage'
import { Movie } from '../types'

const CATEGORIES = ['All', 'Nollywood', 'Hollywood', 'Bollywood', 'K-Drama', 'Series']

export function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    getAllMovies(MOCK_MOVIES).then(setMovies)
  }, [])

  const trending = movies.filter((m) => m.isTrending)
  const newReleases = movies.filter((m) => m.isNewRelease)

  const filtered =
    activeCategory === 'All'
      ? movies
      : movies.filter((m) => m.category === activeCategory)

  return (
    <div className="pb-10">
      <div className="p-6">
        <HeroBanner />
      </div>

      <div className="px-6 mb-8 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-green-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {trending.length > 0 && activeCategory === 'All' && (
        <section className="px-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trending.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {newReleases.length > 0 && activeCategory === 'All' && (
        <section className="px-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">New Releases</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {newReleases.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      <section className="px-6">
        <h2 className="text-2xl font-bold mb-4">
          {activeCategory === 'All' ? 'All Movies' : activeCategory}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-12">No movies in this category yet.</p>
        )}
      </section>
    </div>
  )
}
