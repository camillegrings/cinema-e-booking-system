import React, { useState } from 'react';
import { MOCK_MOVIES, Movie } from '../services/mockData.js';
import { SearchFilterBar } from '../components/SearchFilterBar.css';
import { MovieCard } from '../components/MovieCard.css';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const [movies] = useState<Movie[]>(MOCK_MOVIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  const filteredMovies = movies.filter((movie) => {
    const matchesTitle = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre =
      selectedGenre === 'ALL' || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
    return matchesTitle && matchesGenre;
  });

  const currentlyRunning = filteredMovies.filter((m) => m.category === 'CURRENTLY_RUNNING');
  const comingSoon = filteredMovies.filter((m) => m.category === 'COMING_SOON');

  const handleSelectMovie = (id: number) => {
    alert(`Selected Movie ID: ${id}`);
  };

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
            <div className="movie-grid">
              {currentlyRunning.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelectMovie={handleSelectMovie} />
              ))}
            </div>
          </section>

          <section className="movie-section">
            <h2 className="section-title coming">Coming Soon</h2>
            <div className="movie-grid">
              {comingSoon.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelectMovie={handleSelectMovie} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};