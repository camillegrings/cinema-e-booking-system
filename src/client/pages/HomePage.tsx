import React, { useState, useEffect } from "react";
import { Movie } from "../services/movie.js";
import { SearchFilterBar } from "../components/SearchFilterBar.js";
import { MovieCard } from "../components/MovieCard.js";
import { Header } from "../components/Header.js";
import "./HomePage.css";

const HomePage: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("ALL");

    useEffect(() => {
        fetch("http://localhost:3000/movies/get/all")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                return res.json();
            })
            .then((data: Movie[]) => {
                console.log("Movies fetched successfully:", data);
                setMovies(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching movies:", err);
                setLoading(false);
            });
    }, []);

    // Filter by search bar input and genre selection safely
    const filteredMovies = movies.filter((movie) => {
        const title = movie.title || "";
        const genre = movie.genre || "";

        const matchesTitle = title
            .toLowerCase()
            .includes((searchTerm || "").toLowerCase());

        const matchesGenre =
            !selectedGenre ||
            selectedGenre.toUpperCase() === "ALL" ||
            genre.toLowerCase() === selectedGenre.toLowerCase();

        return matchesTitle && matchesGenre;
    });

    // Categorize movies by status column from database schema
    const currentlyRunning = filteredMovies.filter(
        (m) => m.status === "Currently Running"
    );

    const comingSoon = filteredMovies.filter(
        (m) => m.status === "Coming Soon"
    );

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                Loading catalog...
            </div>
        );
    }

    return (
        <div className="homepage-container">
            <Header />

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
                            <p style={{ color: "#888" }}>No currently running movies.</p>
                        ) : (
                            <div className="movie-grid">
                                {currentlyRunning.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="movie-section">
                        <h2 className="section-title coming">Coming Soon</h2>
                        {comingSoon.length === 0 ? (
                            <p style={{ color: "#888" }}>No upcoming movies.</p>
                        ) : (
                            <div className="movie-grid">
                                {comingSoon.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default HomePage;
export { HomePage };