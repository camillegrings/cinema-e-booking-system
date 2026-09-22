import React, { useState, useEffect } from 'react';
import { useParams } from "react-router";
import { Movie } from '../services/movie.js';
import { Header } from '../components/Header.js'
import { Link } from "react-router-dom";

import './MovieDetails.css';

export const MovieDetails: React.FC = () => {
    let params = useParams();
    const [movie, setMovie] = useState<Movie | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:3000/movies/get/${params.id}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                return res.json();
            })
            .then((data: Movie[]) => {
                setMovie(data[0]);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching movies:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="movie-details-container">
            <Header />
            {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading movie...</div>}
            {movie ? <>
                <div className="movie-details-banner" style={{ backgroundImage: `url(${movie.trailer_image_url})` }}>
                    <h1 className="movie-details-title">{movie.title}</h1>
                    <p className="movie-details-rating">Rating: {movie.mpaa_rating}</p>
                    <button className="movie-details-get-ticket-btn" onClick={() => window.scrollTo({ top: document.getElementById('showtimes')?.offsetTop, behavior: 'smooth' })}>Get Tickets</button>
                </div>
                <div className="movie-details-content">
                    <div>
                        <h3 className="movie-details-subtitle">Synopsis</h3>
                        <p>{movie.synopsis}</p>
                    </div>
                    <div>
                        <h3 className="movie-details-subtitle" id='showtimes'>Showtimes</h3>
                        <div className="movie-details-showtime-wrapper">
                            <Link className="movie-details-showtime" to={`/booking/1`}>2:00 PM</Link>
                            <Link className="movie-details-showtime" to={`/booking/2`}>5:00 PM</Link>
                            <Link className="movie-details-showtime" to={`/booking/3`}>8:00 PM</Link>
                        </div>
                    </div>
                </div>
                <div className="movie-details-trailer-wrapper">
                    <h3 className="movie-details-subtitle">Trailer</h3>
                    <iframe width="620" height="325"
                        src={movie.trailer_video_url}>
                    </iframe>
                </div>
            </> : <div className="movie-details-not-found"><p>Movie not found!</p></div>}
        </div>
    );
};