import { Movie } from '../types'

export const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'King of Boys',
    year: 2018,
    rating: 8.5,
    duration: '2h 49m',
    genres: ['Crime', 'Drama', 'Thriller'],
    synopsis:
      'Alhaja Eniola Salami, a businesswoman and philanthropist with a checkered past and a promising political future, is drawn into a struggle for power that threatens everything she holds dear.',
    cast: ['Sola Sobowale', 'Adesua Etomi-Wellington', 'Reminisce'],
    posterUrl:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200',
    category: 'Nollywood',
    isTrending: true,
  },
  {
    id: '2',
    title: 'Anikulapo',
    year: 2022,
    rating: 7.8,
    duration: '2h 22m',
    genres: ['Drama', 'Fantasy'],
    synopsis:
      'After an affair with a queen leads to his demise, an eager traveler encounters a mystical bird with the power to give him another life.',
    cast: ['Kunle Remi', 'Bimbo Ademoye', 'Sola Sobowale'],
    posterUrl:
      'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=1200',
    category: 'Nollywood',
    isTrending: true,
  },
  {
    id: '3',
    title: 'The Wedding Party',
    year: 2016,
    rating: 7.3,
    duration: '1h 50m',
    genres: ['Comedy', 'Romance'],
    synopsis:
      "As their big day arrives, a couple's lavish wedding plans turn into a nightmare of exes, fighting parents and uninvited guests.",
    cast: ['Adesua Etomi-Wellington', 'Banky W.', 'Richard Mofe-Damijo'],
    posterUrl:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
    category: 'Nollywood',
  },
  {
    id: '4',
    title: 'Brotherhood',
    year: 2022,
    rating: 8.1,
    duration: '2h 0m',
    genres: ['Action', 'Crime', 'Thriller'],
    synopsis:
      "Twin brothers find themselves on opposite sides of the law when one joins a task force hunting down the other's notorious gang.",
    cast: ['Tobi Bakre', 'Falz', 'Basketmouth'],
    posterUrl:
      'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200',
    category: 'Nollywood',
    isNewRelease: true,
  },
  {
    id: '5',
    title: 'Jagun Jagun',
    year: 2023,
    rating: 8.4,
    duration: '2h 14m',
    genres: ['Action', 'Drama', 'History'],
    synopsis:
      'A young man determined to become a mighty warrior joins an elite army, encountering the wrath of a maniacal warlord and the love of a fierce woman.',
    cast: ['Lateef Adedimeji', 'Femi Adebayo', 'Odunlade Adekola'],
    posterUrl:
      'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=1200',
    category: 'Nollywood',
    isTrending: true,
    isNewRelease: true,
  },
  {
    id: '6',
    title: 'Dune: Part Two',
    year: 2024,
    rating: 8.8,
    duration: '2h 46m',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    posterUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    category: 'Hollywood',
    isTrending: true,
    isNewRelease: true,
  },
  {
    id: '7',
    title: 'Oppenheimer',
    year: 2023,
    rating: 8.6,
    duration: '3h 0m',
    genres: ['Biography', 'Drama', 'History'],
    synopsis:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
    posterUrl:
      'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&q=80&w=1200',
    category: 'Hollywood',
  },
  {
    id: '8',
    title: 'Jawan',
    year: 2023,
    rating: 7.5,
    duration: '2h 49m',
    genres: ['Action', 'Thriller'],
    synopsis:
      'A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society.',
    cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi'],
    posterUrl:
      'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&q=80&w=1200',
    category: 'Bollywood',
    isTrending: true,
  },
  {
    id: '9',
    title: 'Squid Game',
    year: 2021,
    rating: 8.0,
    duration: '1 Season',
    genres: ['Action', 'Drama', 'Mystery'],
    synopsis:
      "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
    cast: ['Lee Jung-jae', 'Park Hae-soo', 'Wi Ha-joon'],
    posterUrl:
      'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1200',
    category: 'K-Drama',
  },
  {
    id: '10',
    title: 'Shōgun',
    year: 2024,
    rating: 9.2,
    duration: '1 Season',
    genres: ['Adventure', 'Drama', 'History'],
    synopsis:
      'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power and devastate his enemies.',
    cast: ['Hiroyuki Sanada', 'Cosmo Jarvis', 'Anna Sawai'],
    posterUrl:
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=500',
    backdropUrl:
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=1200',
    category: 'Series',
    isTrending: true,
    isNewRelease: true,
  },
]
