import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { Movie } from '../types/movie.js';
import { Header } from '../components/Header.js'
import { Link } from "react-router-dom";

import './MovieDetails.css';

interface Showtime {
    id: number;
    movie_id: number;
    hall_id: number;
    hall_name: string;
    show_time: string;
}

export const MovieDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    let params = useParams();
    const [movie, setMovie] = useState<Movie | undefined>();
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /* implement when showtimes table is done
            if (!id) return;
            setLoading(true);
            Promise.all([
            fetch(`http://localhost:3000/movies/get/${id}`). then((res) => {
            if (!res.ok) throw new Error(`Movie fetch failed: ${res.status}`);
            return res.json();
            }),
            fetch(`http://localhost:3000/movies/get/showtimes/${id})
            .then((res) => (res.ok ? res.json() : []))
            .catch((err) => {
            console.warn("Could not load dyanmic showtimes, check backend")
            return []
            })
    ]) 
            .then(([movieData, showtimeData]: [Movie[], Showtime[]]) => {
                setMovie(movieData[0]);
                setShowtimes(showtimeData || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching movie details:', err);
                setLoading(false);
            });
    }, [id]);
    const formatTime = (timeStr: string) => {
        const d = new Date(timeStr);
        return isNaN(d.getTime()) ? timeStr : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };
    const formatDate = (timeStr: string) => {
        const d = new Date(timeStr);
        return isNaN(d.getTime()) ? timeStr : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    const groupedShowtimes = showtimes.reduce((acc: Record<string, Showtime[]>, item) => {
        const key = item.show_time ? item.show_time.slice(0, 10) : 'Upcoming';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
    if (loading) {
        return (
            <div className="movie-details-container">
                <Header />
                <div className="movie-details-loading">Loading movie...</div>
            </div>
        );
    }
        if (movie) {
        return (
            <div className="movie-details-container">
                <div className="movie-details-banner" style={{ backgroundImage: `url(${movie.trailer_image_url})` }}>
                    <Header />
                    <div className="movie-details-banner-content">
                        <h1 className="movie-details-title">{movie.title}</h1>
                        <p className="movie-details-rating">Rating: {movie.mpaa_rating}</p>

                        {movie.status === "Currently Running" && (
                            <div className="movie-details-showtimes-container">
                                <h3 className="movie-details-subtitle">Available Showtimes</h3>

                                {Object.keys(groupedShowtimes).length === 0 ? (
                                    <p className="movie-details-empty-showtimes">No upcoming showtimes scheduled.</p>
                                ) : (
                                    Object.keys(groupedShowtimes).sort().map((dateKey) => (
                                        <div key={dateKey} className="showtime-date-group">
                                            <h4 className="showtime-date-title">{formatDate(dateKey)}</h4>
                                            <div className="movie-details-showtime-wrapper">
                                                {groupedShowtimes[dateKey].map((st) => (
                                                    <Link
                                                        key={st.id}
                                                        className="movie-details-showtime-badge"
                                                        to={`/booking/${st.id}`}
                                                    >
                                                        <span className="badge-time">{formatTime(st.show_time)}</span>
                                                        {st.hall_name && <span className="badge-hall">{st.hall_name}</span>}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="movie-details-content">
                    <div>
                        <h3 className="movie-details-subtitle">Synopsis</h3>
                        <p>{movie.synopsis}</p>
                        <h3 className="movie-details-subtitle">Reviews</h3>
                        <p>{movie.reviews}</p>
                        <h3 className="movie-details-subtitle">Cast</h3>
                        <p>{movie.cast}</p>
                        <h3 className="movie-details-subtitle">Director</h3>
                        <p>{movie.director}</p>
                        <h3 className="movie-details-subtitle">Producer</h3>
                        <p>{movie.producer}</p>
                    </div>
                </div>

                <div className="movie-details-trailer-wrapper">
                    <h3 className="movie-details-subtitle">Trailer</h3>
                    <iframe
                        className="movie-details-iframe"
                        src={movie.trailer_video_url}
                        title={`${movie.title} Trailer`}
                        allowFullScreen
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="movie-details-container">
            <Header />
            <div className="movie-details-not-found"><p>Movie not found!</p></div>
        </div>
    );
};
        */
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

    if (loading) {
        return (
            <div className="movie-details-container">
                <div style={{ padding: '2rem' }}>
                    <Header />
                </div>
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading movie...</div>
            </div>

        )
    }

    if (movie) {
        return (
            <div className="movie-details-container">
                <div className="movie-details-banner" style={{ backgroundImage: `url(${movie.trailer_image_url})` }}>
                    <Header />
                    <div className="movie-details-banner-content">
                        <h1 className="movie-details-title">{movie.title}</h1>
                        <p className="movie-details-rating">Rating: {movie.mpaa_rating}</p>
                        {movie.status === "Currently Running" && (
                            <div>
                                <h3 className="movie-details-subtitle">Showtimes</h3>
                                <div className="movie-details-showtime-wrapper">
                                    <Link className="movie-details-showtime" to={`/booking/1`}>2:00 PM</Link>
                                    <Link className="movie-details-showtime" to={`/booking/2`}>5:00 PM</Link>
                                    <Link className="movie-details-showtime" to={`/booking/3`}>8:00 PM</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="movie-details-content">
                    <div>
                        <h3 className="movie-details-subtitle">Synopsis</h3>
                        <p>{movie.synopsis}</p>
                        <h3 className="movie-details-subtitle">Reviews</h3>
                        <p>{movie.reviews}</p>
                        <h3 className="movie-details-subtitle">Cast</h3>
                        <p>{movie.cast}</p>
                        <h3 className="movie-details-subtitle">Director</h3>
                        <p>{movie.director}</p>
                        <h3 className="movie-details-subtitle">Producer</h3>
                        <p>{movie.producer}</p>
                    </div>
                </div>
                <div className="movie-details-trailer-wrapper">
                    <h3 className="movie-details-subtitle">Trailer</h3>
                    <iframe width="620" height="325"
                        src={movie.trailer_video_url} style={{ width: '100%' }}>
                    </iframe>
                </div>
            </div>
        );

    }

    return (
        <div className="movie-details-container">
            <div style={{ padding: '2rem' }}>
                <Header />
            </div>
            <div className="movie-details-not-found"><p>Movie not found!</p></div>
        </div>
    );
};