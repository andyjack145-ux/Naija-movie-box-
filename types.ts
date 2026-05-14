export interface Movie {  
  id: string  
  title: string  
  year: number  
  rating: number  
  duration: string  
  genres: string[]  
  synopsis: string  
  cast: string[]  
  posterUrl: string  
  backdropUrl: string  
  category: 'Nollywood' | 'Hollywood' | 'Bollywood' | 'K-Drama' | 'Series'  
  isTrending?: boolean  
  isNewRelease?: boolean  
}  
  
export interface User {  
  id: string  
  email: string  
  name: string  
  isPremium: boolean  
}  
  
export interface DownloadItem {  
  id: string  
  movieId: string  
  quality: string  
  progress: number  
  status: 'downloading' | 'completed' | 'paused'  
  size: string  
}  
  
export interface WatchHistoryItem {  
  movieId: string  
  progress: number // 0 to 100  
  lastWatched: number // timestamp  
}
