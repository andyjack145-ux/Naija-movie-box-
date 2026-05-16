import React from 'react'

export function AdBanner() {
  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-center">
      <p className="text-sm text-gray-500 mb-2">
        Sponsored Advertisement
      </p>

      <div className="bg-[#1a1a1a] h-[100px] rounded-xl flex items-center justify-center text-gray-400">
        Google AdSense Banner Space
      </div>
    </div>
  )
}
