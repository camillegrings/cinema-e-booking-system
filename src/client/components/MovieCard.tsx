import React, { useState } from "react";
import { Movie } from "../types/movie.js";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import "./MovieCard.css";

interface Props {
    movie: Movie;
    toggleFavoriteCallback?: Function
}

export const MovieCard: React.FC<Props> = ({ movie, toggleFavoriteCallback }) => {
    const { isAuthenticated, token } = useAuth();
    const [isFavorite, setIsFavorite] = useState(movie.is_favorite);

    function requestFavoriteMovie(method: 'POST' | 'DELETE') {
        fetch(`http://localhost:3000/movies/favorites/${movie.id}`, {
            headers: { "Authorization": `Bearer ${token}` }, method
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

                if (toggleFavoriteCallback) {
                    toggleFavoriteCallback()
                }
            })
            .catch((err) => {
                console.error('Error fetching movies:', err);
            });
    }

    function toggleFavoriteMovie(e: React.ChangeEvent<HTMLInputElement>) {
        const isChecked = e.target.checked

        setIsFavorite(isChecked)

        if (isChecked) {
            requestFavoriteMovie('POST')
        } else {
            requestFavoriteMovie('DELETE')
        }
    }

    return (
        <div className='movie-card'>
            {isAuthenticated && (
                <label className='movie-favorite'>
                    <input type="checkbox" onChange={toggleFavoriteMovie} checked={isFavorite} />
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