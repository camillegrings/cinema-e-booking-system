export interface Movie {
  id: number;
  title: string;
  category: 'CURRENTLY_RUNNING' | 'COMING_SOON';
  genre: string;
  rating: string;
  description: string;
  poster_url: string;
  trailer_url: string;
  showtimes?: string[];
}

export const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Inception",
    category: "CURRENTLY_RUNNING",
    genre: "Sci-Fi",
    rating: "PG-13",
    description: "A thief who steals corporate secrets through dream-sharing technology.",
    poster_url: "https://via.placeholder.com/200x300?text=Inception",
    trailer_url: "https://www.youtube.com/embed/YoHD9XEInc0"
  },
  {
    id: 2,
    title: "The Dark Knight",
    category: "CURRENTLY_RUNNING",
    genre: "Action",
    rating: "PG-13",
    description: "Batman accepts his greatest psychological and physical tests.",
    poster_url: "https://via.placeholder.com/200x300?text=The+Dark+Knight",
    trailer_url: "https://www.youtube.com/embed/EXeTwQWrcwY"
  },
  {
    id: 3,
    title: "Dune: Part Two",
    category: "COMING_SOON",
    genre: "Sci-Fi",
    rating: "PG-13",
    description: "Paul Atreides unites with Chani and the Fremen to seek revenge.",
    poster_url: "https://via.placeholder.com/200x300?text=Dune+2",
    trailer_url: "https://www.youtube.com/embed/Way9Dexny3w"
  }
];