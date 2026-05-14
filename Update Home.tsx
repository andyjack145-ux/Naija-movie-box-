import React from 'react'
import { MOCK_MOVIES } from '../data/mockData'
import { MovieCard } from '../components/movie/MovieCard'
import { HeroBanner } from '../components/movie/HeroBanner'
import { AdBanner } from '../components/ads/AdBanner'

export function Home() {
  return (
    <div className="p-6">
      <HeroBanner />

      <AdBanner />

      <h1 className="text-3xl font-bold mt-8 mb-6">
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
