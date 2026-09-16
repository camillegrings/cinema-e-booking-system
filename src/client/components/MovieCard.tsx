import React from 'react';
import { Movie } from '../services/mockData';
import './MovieCard.css';

interface Props {
  movie: Movie;
  onSelectMovie: (id: number) => void;
}

export const MovieCard: React.FC<Props> = ({ movie, onSelectMovie }) => {
  return (
    <div className="movie-card">
      <div>
        <img src={movie.poster_url} alt={movie.title} className="movie-poster" />
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-detail">
          <strong>Genre:</strong> {movie.genre}
        </p>
        <p className="movie-detail">
          <strong>Rating:</strong> {movie.rating}
        </p>
      </div>

      <button className="btn-details" onClick={() => onSelectMovie(movie.id)}>
        View Details & Showtimes
      </button>
    </div>
  );
};