import React, { useEffect, useState } from 'react'

export function VideoAd({ onFinish }: any) {
  const [count, setCount] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onFinish()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">
        Advertisement
      </h1>

      <p className="text-gray-400 mb-6">
        Your movie starts in {count}s
      </p>

      <div className="w-[300px] h-[200px] bg-[#111] rounded-2xl flex items-center justify-center">
        Video Ad Space
      </div>
    </div>
  )
}
