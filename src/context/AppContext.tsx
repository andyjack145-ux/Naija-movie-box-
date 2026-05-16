import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext<any>(null)

export function AppProvider({ children }: any) {
  const [watchlist, setWatchlist] = useState<string[]>([])

  return (
    <AppContext.Provider
      value={{
        watchlist,
        setWatchlist,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
