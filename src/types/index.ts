export interface Movie {
  id: string
  title: string
  posterUrl: string
  backdropUrl: string
  synopsis: string
  year: number
  rating: number
  duration?: string
  genres?: string[]
  cast?: string[]
  category?: string
  isTrending?: boolean
  isNewRelease?: boolean
  access?: 'free' | 'paid'
  price?: number
}
