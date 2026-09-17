import React, { useState, useEffect } from 'react';
import { Movie } from '../services/movie';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { MovieCard } from '../components/MovieCard';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  useEffect(() => {
    fetch('http://localhost:3000/api/movies')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then((data: Movie[]) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching movies:', err);
        setLoading(false);
      });
  }, []);

  // Normalize today's date to midnight for clean comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredMovies = movies.filter((movie) => {
    const matchesTitle = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre =
      selectedGenre === 'ALL' || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
    return matchesTitle && matchesGenre;
  });

  // Parse release date string safely and normalize time to midnight
  const currentlyRunning = filteredMovies.filter((m) => {
    const releaseDate = new Date(m.release_date);
    // Adjust for UTC offset shift from DATE strings YYYY-MM-DD
    const normalizedRelease = new Date(
      releaseDate.getUTCFullYear(),
      releaseDate.getUTCMonth(),
      releaseDate.getUTCDate()
    );
    return normalizedRelease <= today;
  });

  const comingSoon = filteredMovies.filter((m) => {
    const releaseDate = new Date(m.release_date);
    const normalizedRelease = new Date(
      releaseDate.getUTCFullYear(),
      releaseDate.getUTCMonth(),
      releaseDate.getUTCDate()
    );
    return normalizedRelease > today;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading catalog...</div>;
  }

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>Cinema E-Booking System</h1>
        <p>Browse current movies and upcoming releases</p>
      </header>

      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
      />

      {filteredMovies.length === 0 ? (
        <div className="no-results">
          <h3>No movies found matching your criteria.</h3>
        </div>
      ) : (
        <>
          <section className="movie-section">
            <h2 className="section-title running">Currently Running</h2>
            {currentlyRunning.length === 0 ? (
              <p style={{ color: '#888' }}>No currently running movies.</p>
            ) : (
              <div className="movie-grid">
                {currentlyRunning.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onSelectMovie={(id) => alert(`Selected Movie ID: ${id}`)} />
                ))}
              </div>
            )}
          </section>

          <section className="movie-section">
            <h2 className="section-title coming">Coming Soon</h2>
            {comingSoon.length === 0 ? (
              <p style={{ color: '#888' }}>No upcoming movies.</p>
            ) : (
              <div className="movie-grid">
                {comingSoon.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onSelectMovie={(id) => alert(`Selected Movie ID: ${id}`)} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};