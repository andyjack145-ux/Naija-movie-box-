import React from 'react'
import { Link } from 'react-router-dom'

export function HeroBanner() {
  return (
    <div className="relative h-[500px] rounded-3xl overflow-hidden mb-8">
      <img
        src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 flex flex-col justify-end h-full p-8">
        <h1 className="text-5xl font-black mb-4">
          Watch Trending Movies
        </h1>

        <p className="max-w-xl text-gray-300 mb-6">
          Stream Nollywood, Hollywood, Bollywood and more.
        </p>

        <Link
          to="/"
          className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-3 rounded-xl w-fit"
        >
          Start Watching
        </Link>
      </div>
    </div>
  )
}
