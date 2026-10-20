import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header.js'
import { MovieCard } from '../components/MovieCard.js'

import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
    const mockFavoriteMovies = [{
        cast: "Sandra Bullock, Nicole Kidman, Joey King, Lee Pace, Maisie Williams, Xolo Maridueña",
        created_at: "2026-09-28T17:15:22.000Z",
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

    return (
        <div className="profile-container">
            <Header />
            <div className="profile-content">
                <h2>Edit Profile</h2>

                <h2>Favorite Movies</h2>
                <div className="profile-movie-grid">
                    {mockFavoriteMovies.map((movie) => <MovieCard movie={movie} />)}
                </div>
            </div>
        </div>
    );
};
