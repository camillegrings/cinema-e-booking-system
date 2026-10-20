import React from "react";
import { Movie } from "../types/movie.js";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import "./MovieCard.css";

interface Props {
    movie: Movie;
}

export const MovieCard: React.FC<Props> = ({ movie }) => {
    const { isAuthenticated } = useAuth();

    function favoriteMovie() {
        // request backend
    }

    return (
        <div className='movie-card'>
            {isAuthenticated && (
                <label className='movie-favorite'>
                    <input type="checkbox" onChange={favoriteMovie} /*checked={movie.isFavorite}*/ />
                    <span className="favorite-icon"></span>
                </label>
            )}
            <img
                src={movie.trailer_image_url}
                alt={movie.title}
                className='movie-poster'
                onError={(e) => {
                    (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/200x300?text=No+Poster";
                }}
            />

            <div className='movie-info'>
                <div className='movie-info'>
                    <h3 className='movie-title'>{movie.title}</h3>
                    <p className='movie-detail'>
                        <strong>Genre:</strong> {movie.genre}
                    </p>
                    <p className='movie-detail'>
                        <strong>Rating:</strong> {movie.mpaa_rating}
                    </p>
                </div>

                <Link className="btn-details" to={`/movie/${movie.id}`}>
                    {movie.status === "Coming Soon" ? 'View Details' : 'View Details & Showtimes'}
                </Link>
            </div>
        </div>
    );
};