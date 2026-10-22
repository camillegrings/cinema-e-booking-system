import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Header } from '../components/Header.js'
import { MovieCard } from '../components/MovieCard.js'
import { useAuth } from '../context/AuthContext.js'

import { Movie } from '../types/movie.js'

import './FavoritePage.css';

export const FavoritePage: React.FC = () => {
    const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth()

    function loadFavoriteMovies() {
        setLoading(true);

        fetch(`http://localhost:3000/movies/favorites`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                return res.json();
            })
            .then((data: Movie[]) => {
                setFavoriteMovies(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching movies:', err);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadFavoriteMovies()
    }, []);

    if (loading) {
        return (
            <div className="favorite-page-container">
                <Header />
                <div className="favorite-page-content">
                    <h2>Favorite Movies</h2>
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Loading favorite movies...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="favorite-page-container">
            <Header />
            <div className="favorite-page-content">
                <h2>Favorite Movies</h2>
                <div className="favorite-page-movie-grid">
                    {favoriteMovies.map((movie) => <MovieCard key={movie.id} movie={movie} toggleFavoriteCallback={loadFavoriteMovies} />)}
                </div>
                {!favoriteMovies.length && (
                    <div className="favorite-page-empty">
                        <p className="favorite-page-empty-title">You don't have any favorite movies.</p>
                        <p>Browse the Home page and add your favorite movies by clicking on the heart icon.</p>
                        <Link className="favorite-page-btn" to={`/`}>Browse Home Page</Link>
                    </div>
                )}
            </div>
        </div>
    );
};
