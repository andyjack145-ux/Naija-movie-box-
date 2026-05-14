export interface Movie {
  id: string
  title: string
  posterUrl: string
  backdropUrl: string
  synopsis: string
  year: number
  rating: number
  access?: 'free' | 'paid'
  price?: number
}
