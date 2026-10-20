import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Header } from '../components/Header.js'
import { MovieCard } from '../components/MovieCard.js'

import { Movie } from '../types/movie.js'

import './FavoritePage.css';

const MOCK_FAVORITE_MOVIES: Movie[] = [{
    cast: "Sandra Bullock, Nicole Kidman, Joey King, Lee Pace, Maisie Williams, Xolo Maridueña",
    director: "Susanne Bier",
    genre: "Fantasy",
    id: 1,
    mpaa_rating: "PG-13",
    producer: "Denise Di Novi, Sandra Bullock, Nicole Kidman",
    release_date: "2026-09-11T04:00:00.000Z",
    reviews: "A fantasy sequel featuring magic, family, romance, and comedy.",
    status: "Coming Soon",
    synopsis: "The Owens sisters return to confront a dark curse threatening their family.",
    title: "Practical Magic 2",
    trailer_image_url: "https://img.youtube.com/vi/Ho10_4IX1jE/maxresdefault.jpg",
    trailer_video_url: "https://www.youtube.com/embed/Ho10_4IX1jE"
},
{
    cast: "Sandra Bullock, Nicole Kidman, Joey King, Lee Pace, Maisie Williams, Xolo Maridueña",
    director: "Susanne Bier",
    genre: "Fantasy",
    id: 1,
    mpaa_rating: "PG-13",
    producer: "Denise Di Novi, Sandra Bullock, Nicole Kidman",
    release_date: "2026-09-11T04:00:00.000Z",
    reviews: "A fantasy sequel featuring magic, family, romance, and comedy.",
    status: "Currently Running",
    synopsis: "The Owens sisters return to confront a dark curse threatening their family.",
    title: "Practical Magic 2",
    trailer_image_url: "https://img.youtube.com/vi/Ho10_4IX1jE/maxresdefault.jpg",
    trailer_video_url: "https://www.youtube.com/embed/Ho10_4IX1jE"
}]

export const FavoritePage: React.FC = () => {
    const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // fetch(`http://localhost:3000/user/get/favoriteMovies`)
        //     .then((res) => {
        //         if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        //         return res.json();
        //     })
        //     .then((data: Movie[]) => {
        //         setFavoriteMovies(data);
        //         setLoading(false);
        //     })
        //     .catch((err) => {
        //         console.error('Error fetching movies:', err);
        //         setLoading(false);
        //     });

        // Mock Api request
        setTimeout(() => {
            setFavoriteMovies(MOCK_FAVORITE_MOVIES);
            setLoading(false);
        }, 500);
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
                    {favoriteMovies.map((movie) => <MovieCard movie={movie} />)}
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
