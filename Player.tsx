import React from 'react'
import ReactPlayer from 'react-player'

export function Player() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl aspect-video">
        <ReactPlayer
          url="https://www.w3schools.com/html/mov_bbb.mp4"
          controls
          width="100%"
          height="100%"
          playing
        />
      </div>
    </div>
  )
}
