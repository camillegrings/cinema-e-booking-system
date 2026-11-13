
import React, { useState, useEffect, FormEvent } from "react";
import { Header } from "../components/Header.js";
import { useAuth } from "../context/AuthContext.js";
import "./ManageShowtime.css";

type Movie = {
    id: number;
    title: string;
    genre: string;
    runtime_minutes: number;
    release_date?: string;
    status?: string;
    trailer_image_url?: string;
};

type Showroom = {
    id: number;
    name: string;
};

type Showtime = {
    id: number;
    movie_id: number;
    movie_title?: string;
    showroom_id: number;
    showroom_name?: string;
    show_time: string;
    duration: number;
    end_time: string;
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type Message = {
    text: string;
    type: "success" | "error";
} | null;

type ScheduleFormData = {
    date: string;
    start_time: string;
    showroom_id: string;
};

const API_URL = "http://localhost:3000";
const PAGE_SIZE = 4;
const SCHEDULE_BUFFER_MINUTES = 15;
// Theater operating hours
const OPENING_TIME = "10:00";
const CLOSING_TIME = "23:00";
const SLOT_INTERVAL = 30;

const INITIAL_FORM_DATA: ScheduleFormData = {
    date: "",
    start_time: "",
    showroom_id: "",
};

const INITIAL_PAGINATION: Pagination = {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
};

export const ManageShowtime: React.FC = () => {
    const { token } = useAuth();

    // Movie catalog
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [genreFilter, setGenreFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] =
        useState<Pagination>(INITIAL_PAGINATION);
    const [isLoadingMovies, setIsLoadingMovies] = useState(false);
    const [moviesError, setMoviesError] = useState("");

    // Selected movie
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    // Screening details
    const [formData, setFormData] =
        useState<ScheduleFormData>(INITIAL_FORM_DATA);
    const [showrooms, setShowrooms] = useState<Showroom[]>([]);
    const [isLoadingShowrooms, setIsLoadingShowrooms] = useState(false);

    // Availability
    const [existingShowtimes, setExistingShowtimes] = useState<Showtime[]>([]);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
    const [availabilityError, setAvailabilityError] = useState("");

    // Form state
    const [message, setMessage] = useState<Message>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Get today's date in local timezone (YYYY-MM-DD)
    const getTodayDate = (): string => {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // Format runtime
    const formatRuntime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours === 0) return `${remainingMinutes} min`;
        if (remainingMinutes === 0) return `${hours}h`;

        return `${hours}h ${remainingMinutes}min`;
    };

    // Convert HH:mm or YYYY-MM-DD HH:mm:ss into minutes
    const toMinutes = (value: string): number => {
        const time = value.includes("T")
            ? value.split("T")[1]
            : value.includes(" ")
                ? value.split(" ")[1]
                : value;

        if (time !== undefined) {
            const [hours, minutes] = time.split(":").map(Number);

            return hours !== undefined && minutes !== undefined ? hours * 60 + minutes : 0;
        }

        return 0
    };

    // Convert minutes since midnight to HH:mm
    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(
            remainingMinutes
        ).padStart(2, "0")}`;
    };

    // Generate available start times based on movie runtime and existing screenings
    const getAvailableTimeSlots = (): string[] => {
        if (!selectedMovie || !availabilityLoaded) return [];

        const openingMinutes = toMinutes(OPENING_TIME);
        const closingMinutes = toMinutes(CLOSING_TIME);
        const duration = selectedMovie.runtime_minutes;

        const availableSlots: string[] = [];

        for (
            let start = openingMinutes;
            start + duration <= closingMinutes;
            start += SLOT_INTERVAL
        ) {
            const end = start + duration;

            const hasConflict = existingShowtimes.some((showtime) => {
                const existingStart = toMinutes(showtime.show_time);
                let existingEnd = toMinutes(showtime.end_time);

                // Handle existing screenings ending after midnight
                if (existingEnd <= existingStart) {
                    existingEnd += 24 * 60;
                }

                return (
                    start < existingEnd + SCHEDULE_BUFFER_MINUTES &&
                    end + SCHEDULE_BUFFER_MINUTES > existingStart
                );
            });

            if (!hasConflict) {
                availableSlots.push(minutesToTime(start));
            }
        }

        return availableSlots;
    };

    // Format time for display
    const formatTime = (time: string): string => {
        if (!time) return "";

        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date();

        if (hours !== undefined && minutes !== undefined) {
            date.setHours(hours, minutes, 0, 0);

            return date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
            });
        }

        return ''
    };

    // Calculate screening end time using the movie runtime
    const getEndTime = (): string => {
        if (!selectedMovie || !formData.start_time) return "";

        const totalMinutes =
            toMinutes(formData.start_time) + selectedMovie.runtime_minutes;

        // This implementation does not support screenings ending after midnight.
        if (totalMinutes >= 24 * 60) return "";

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const endTime = getEndTime();

    // Fetch paginated movies with server-side filters
    useEffect(() => {
        const controller = new AbortController();

        const fetchMovies = async () => {
            setIsLoadingMovies(true);
            setMoviesError("");

            try {
                const params = new URLSearchParams({
                    page: String(page),
                    limit: String(PAGE_SIZE),
                });

                if (searchQuery.trim()) {
                    params.set("query", searchQuery.trim());
                }

                if (genreFilter) params.set("genre", genreFilter);
                if (statusFilter) params.set("status", statusFilter);

                const response = await fetch(
                    `${API_URL}/movies/catalog?${params.toString()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load movies.");
                }

                setMovies(data.movies ?? []);
                setPagination(data.pagination ?? INITIAL_PAGINATION);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;

                setMoviesError(
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred."
                );
                setMovies([]);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingMovies(false);
                }
            }
        };

        const timeout = setTimeout(fetchMovies, 300);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [page, searchQuery, genreFilter, statusFilter, token]);

    // Fetch showrooms
    useEffect(() => {
        const controller = new AbortController();

        const fetchShowrooms = async () => {
            setIsLoadingShowrooms(true);

            try {
                const response = await fetch(`${API_URL}/showrooms/get/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load showrooms.");
                }

                setShowrooms(data.showrooms ?? []);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;

                setMessage({
                    text: err instanceof Error
                        ? err.message
                        : "Failed to load showrooms.",
                    type: "error",
                });
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingShowrooms(false);
                }
            }
        };

        fetchShowrooms();

        return () => controller.abort();
    }, [token]);

    // Fetch existing showtimes for the selected date and showroom
    useEffect(() => {
        if (!formData.date || !formData.showroom_id) {
            setExistingShowtimes([]);
            setAvailabilityLoaded(false);
            setAvailabilityError("");
            return;
        }

        const controller = new AbortController();

        const fetchShowtimes = async () => {
            setIsCheckingAvailability(true);
            setAvailabilityLoaded(false);
            setAvailabilityError("");

            try {
                const params = new URLSearchParams({
                    date: formData.date,
                    showroom_id: formData.showroom_id,
                });

                const response = await fetch(
                    `${API_URL}/showtimes?${params.toString()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to check showroom availability."
                    );
                }

                setExistingShowtimes(data.showtimes ?? []);
                setAvailabilityLoaded(true);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;

                setAvailabilityError(
                    err instanceof Error
                        ? err.message
                        : "Unable to check showroom availability."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsCheckingAvailability(false);
                }
            }
        };

        fetchShowtimes();

        return () => controller.abort();
    }, [formData.date, formData.showroom_id, token]);

    // Check for overlapping showtimes, including the required buffer
    const hasScheduleConflict = (): boolean => {
        if (!formData.start_time || !endTime || !availabilityLoaded) {
            return false;
        }

        const newStart = toMinutes(formData.start_time);
        const newEnd = toMinutes(endTime);

        return existingShowtimes.some((showtime) => {
            const existingStart = toMinutes(showtime.show_time);
            let existingEnd = toMinutes(showtime.end_time);

            // Account for an existing screening that ends after midnight
            if (existingEnd <= existingStart) {
                existingEnd += 24 * 60;
            }

            return (
                newStart < existingEnd + SCHEDULE_BUFFER_MINUTES &&
                newEnd + SCHEDULE_BUFFER_MINUTES > existingStart
            );
        });
    };

    const scheduleConflict = hasScheduleConflict();
    const availableTimeSlots = getAvailableTimeSlots();

    // Handle filter changes and reset pagination
    const handleFilterChange = (
        setter: React.Dispatch<React.SetStateAction<string>>,
        value: string
    ) => {
        setter(value);
        setPage(1);
    };

    // Select a movie from the catalog
    const handleSelectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
        setFormData((prev) => ({
            ...prev,
            start_time: "",
        }));
        setMessage(null);
    };

    // Change selected movie
    const handleChangeMovie = () => {
        setSelectedMovie(null);
        setFormData((prev) => ({
            ...prev,
            start_time: "",
        }));
    };

    // Handle screening form changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "date" || name === "showroom_id"
                ? { start_time: "" }
                : {}),
        }));

        setMessage(null);
    };

    // Validate screening details
    const validateForm = (): boolean => {
        if (!selectedMovie) {
            setMessage({
                text: "Please select a movie.",
                type: "error",
            });
            return false;
        }

        if (!formData.date || formData.date < getTodayDate()) {
            setMessage({
                text: "Please select a valid date.",
                type: "error",
            });
            return false;
        }

        if (!formData.showroom_id) {
            setMessage({
                text: "Please select a showroom.",
                type: "error",
            });
            return false;
        }

        if (!formData.start_time) {
            setMessage({
                text: "Please select a start time.",
                type: "error",
            });
            return false;
        }

        if (!endTime) {
            setMessage({
                text: "The screening cannot end after midnight.",
                type: "error",
            });
            return false;
        }

        if (!availabilityLoaded || availabilityError) {
            setMessage({
                text: "Showroom availability must be checked before scheduling.",
                type: "error",
            });
            return false;
        }

        if (scheduleConflict) {
            setMessage({
                text: "This time conflicts with another screening in the selected showroom.",
                type: "error",
            });
            return false;
        }

        return true;
    };

    // Open confirmation modal
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        if (!validateForm()) return;

        setShowConfirmModal(true);
    };

    // Submit showtime to backend
    const confirmScheduleShowtime = async () => {
        if (!selectedMovie) return;

        setShowConfirmModal(false);
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/showtimes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    movie_id: selectedMovie.id,
                    showroom_id: Number(formData.showroom_id),
                    date: formData.date,
                    start_time: formData.start_time,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.status === 409) {
                throw new Error(
                    data.message ||
                    "This showroom already has a conflicting screening."
                );
            }

            if (!response.ok) {
                throw new Error(data.message || "Failed to schedule showtime.");
            }

            setMessage({
                text: "Showtime scheduled successfully!",
                type: "success",
            });

            // Reset the selected movie and time, preserving date and showroom
            setSelectedMovie(null);
            setFormData(INITIAL_FORM_DATA);
        } catch (err) {
            setMessage({
                text: err instanceof Error
                    ? err.message
                    : "An unexpected error occurred.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Automatically dismiss notifications
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage(null);
        }, 4000);

        return () => clearTimeout(timer);
    }, [message]);

    const canSubmit =
        !!selectedMovie &&
        !!formData.date &&
        !!formData.start_time &&
        !!formData.showroom_id &&
        !!endTime &&
        availabilityLoaded &&
        !availabilityError &&
        !isCheckingAvailability &&
        !scheduleConflict &&
        !isSubmitting;

    return (
        <div className="schedule-movie-page">
            <Header />

            <main className="schedule-movie-container">
                <h2>Schedule a Movie</h2>

                <p className="form-description">
                    Select a movie from the catalog and enter the screening
                    details below to add a new showtime.
                </p>

                {message && (
                    <div
                        className={`toast ${message.type}`}
                        role={message.type === "error" ? "alert" : "status"}
                        aria-live="polite"
                    >
                        {message.text}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="schedule-movie-form"
                    noValidate
                >
                    {/* MOVIE SELECTION */}
                    <section className="form-section">
                        <h3>Movie Selection</h3>

                        {selectedMovie ? (
                            <div className="selected-movie">
                                <div className="selected-movie-info">
                                    {selectedMovie.trailer_image_url ? (
                                        <img
                                            src={selectedMovie.trailer_image_url}
                                            alt={`${selectedMovie.title} poster`}
                                        />
                                    ) : (
                                        <div className="movie-poster-placeholder">
                                            No poster
                                        </div>
                                    )}

                                    <div className="selected-movie-details">
                                        <span className="field-hint">
                                            Selected movie
                                        </span>
                                        <h4>{selectedMovie.title}</h4>
                                        <p>
                                            {selectedMovie.genre} ·{" "}
                                            {formatRuntime(
                                                selectedMovie.runtime_minutes
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn-change-movie"
                                    onClick={handleChangeMovie}
                                >
                                    Change Movie
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="input-group">
                                    <label htmlFor="movie-search">
                                        Search Movie
                                    </label>

                                    <input
                                        type="search"
                                        id="movie-search"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                setSearchQuery,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search by movie title..."
                                    />

                                    <small className="field-hint">
                                        You can also browse the catalog using
                                        the filters below.
                                    </small>
                                </div>

                                <div className="fields-wrapper movie-filters">
                                    <div className="input-group">
                                        <label htmlFor="genre-filter">
                                            Genre
                                        </label>

                                        <select
                                            id="genre-filter"
                                            value={genreFilter}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    setGenreFilter,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">All Genres</option>
                                            <option value="Sci-Fi">Sci-Fi</option>
                                            <option value="Action">Action</option>
                                            <option value="Horror">Horror</option>
                                            <option value="Romance">Romance</option>
                                            <option value="Animation">Animation</option>
                                            <option value="Fantasy">Fantasy</option>
                                            <option value="Thriller">Thriller</option>
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="status-filter">
                                            Movie Status
                                        </label>

                                        <select
                                            id="status-filter"
                                            value={statusFilter}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    setStatusFilter,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="Currently Running">
                                                Currently Running
                                            </option>
                                            <option value="Coming Soon">
                                                Coming Soon
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="catalog-header">
                                    <p>
                                        {pagination.total}{" "}
                                        {pagination.total === 1
                                            ? "movie"
                                            : "movies"}{" "}
                                        found
                                    </p>

                                    <button
                                        type="button"
                                        className="btn-clear-filters"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setGenreFilter("");
                                            setStatusFilter("");
                                            setPage(1);
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>

                                {isLoadingMovies ? (
                                    <p className="catalog-message">
                                        Loading movies...
                                    </p>
                                ) : moviesError ? (
                                    <p className="field-error">
                                        {moviesError}
                                    </p>
                                ) : movies.length === 0 ? (
                                    <p className="catalog-message">
                                        No movies found. Try changing your
                                        search or filters.
                                    </p>
                                ) : (
                                    <div className="movie-grid">
                                        {movies.map((movie) => (
                                            <button
                                                type="button"
                                                key={movie.id}
                                                className="movie-card"
                                                onClick={() =>
                                                    handleSelectMovie(movie)
                                                }
                                            >
                                                {movie.trailer_image_url ? (
                                                    <img
                                                        src={movie.trailer_image_url}
                                                        alt={`${movie.title} poster`}
                                                    />
                                                ) : (
                                                    <div className="movie-poster-placeholder">
                                                        No poster
                                                    </div>
                                                )}

                                                <div className="movie-card-info">
                                                    <h4>{movie.title}</h4>
                                                    <p>{movie.genre}</p>
                                                    <span>
                                                        {formatRuntime(
                                                            movie.runtime_minutes
                                                        )}
                                                    </span>
                                                </div>

                                                <span className="movie-card-action">
                                                    Select Movie
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {pagination.totalPages > 1 && (
                                    <div className="catalog-pagination">
                                        <button
                                            type="button"
                                            disabled={
                                                page <= 1 || isLoadingMovies
                                            }
                                            onClick={() =>
                                                setPage((prev) => prev - 1)
                                            }
                                        >
                                            Previous
                                        </button>

                                        <span>
                                            Page {page} of{" "}
                                            {pagination.totalPages}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                page >= pagination.totalPages ||
                                                isLoadingMovies
                                            }
                                            onClick={() =>
                                                setPage((prev) => prev + 1)
                                            }
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {/* SCREENING DETAILS */}
                    {selectedMovie && (
                        <section className="form-section">
                            <h3>Screening Details</h3>

                            <div className="fields-wrapper">
                                <div className="input-group">
                                    <label htmlFor="date">
                                        Screening Date *
                                    </label>

                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        min={getTodayDate()}
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="showroom_id">
                                        Showroom *
                                    </label>

                                    <select
                                        id="showroom_id"
                                        name="showroom_id"
                                        value={formData.showroom_id}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoadingShowrooms}
                                    >
                                        <option value="">
                                            {isLoadingShowrooms
                                                ? "Loading showrooms..."
                                                : "Select a showroom"}
                                        </option>

                                        {showrooms.map((showroom) => (
                                            <option
                                                key={showroom.id}
                                                value={showroom.id}
                                            >
                                                {showroom.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="start_time">
                                    Available Start Times *
                                </label>

                                <select
                                    id="start_time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    required
                                    disabled={
                                        !availabilityLoaded ||
                                        isCheckingAvailability ||
                                        !!availabilityError ||
                                        availableTimeSlots.length === 0
                                    }
                                >
                                    <option value="">
                                        {isCheckingAvailability
                                            ? "Checking availability..."
                                            : !availabilityLoaded
                                                ? "Select a date and showroom first"
                                                : availableTimeSlots.length === 0
                                                    ? "No available times"
                                                    : "Select a start time"}
                                    </option>

                                    {availableTimeSlots.map((time) => (
                                        <option key={time} value={time}>
                                            {formatTime(time)}
                                        </option>
                                    ))}
                                </select>

                                {availabilityLoaded && availableTimeSlots.length > 0 && (
                                    <small className="field-hint">
                                        {availableTimeSlots.length} available starting times.
                                        Screenings require a {SCHEDULE_BUFFER_MINUTES}-minute
                                        interval between movies.
                                    </small>
                                )}

                                {availabilityLoaded && availableTimeSlots.length === 0 && (
                                    <p className="field-error">
                                        No available starting times for this movie on the selected date.
                                    </p>
                                )}
                            </div>

                            {formData.start_time && (
                                <div className="screening-summary">
                                    <h4>Screening Summary</h4>

                                    <div className="fields-wrapper">
                                        <p>
                                            <span>Movie Runtime</span>
                                            <strong>
                                                {formatRuntime(
                                                    selectedMovie.runtime_minutes
                                                )}
                                            </strong>
                                        </p>

                                        <p>
                                            <span>Start Time</span>
                                            <strong>
                                                {formatTime(formData.start_time)}
                                            </strong>
                                        </p>

                                        <p>
                                            <span>End Time</span>
                                            <strong>
                                                {endTime
                                                    ? formatTime(endTime)
                                                    : "Ends after midnight"}
                                            </strong>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {formData.date && formData.showroom_id && (
                                <div className="availability-status">
                                    {isCheckingAvailability ? (
                                        <p>Checking showroom availability...</p>
                                    ) : availabilityError ? (
                                        <p className="field-error">{availabilityError}</p>
                                    ) : availabilityLoaded ? (
                                        <>
                                            <div className="availability-header">
                                                <h4>Showroom Schedule</h4>
                                                <span className="field-hint">
                                                    {formatTime(OPENING_TIME)} – {formatTime(CLOSING_TIME)}
                                                </span>
                                            </div>

                                            {existingShowtimes.length > 0 ? (
                                                <div className="existing-showtimes">
                                                    <p className="field-hint">
                                                        Existing screenings
                                                    </p>

                                                    {existingShowtimes.map((showtime) => (
                                                        <div
                                                            className="existing-showtime-item"
                                                            key={showtime.id}
                                                        >
                                                            <div>
                                                                <strong>
                                                                    {showtime.movie_title ||
                                                                        `Movie #${showtime.movie_id}`}
                                                                </strong>

                                                                <span>
                                                                    {formatTime(
                                                                        minutesToTime(
                                                                            toMinutes(showtime.show_time)
                                                                        )
                                                                    )}
                                                                    {" – "}
                                                                    {formatTime(
                                                                        minutesToTime(
                                                                            toMinutes(showtime.end_time)
                                                                        )
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <span className="occupied-label">
                                                                Occupied
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="availability-success">
                                                    No screenings scheduled for this showroom on this date.
                                                </p>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </section>
                    )}

                    {/* FORM ACTIONS */}
                    {selectedMovie && (
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                disabled={isSubmitting}
                                onClick={() => {
                                    setSelectedMovie(null);
                                    setFormData(INITIAL_FORM_DATA);
                                    setMessage(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={!canSubmit}
                            >
                                Review Showtime
                            </button>
                        </div>
                    )}
                </form>

                {/* CONFIRMATION MODAL */}
                {showConfirmModal && selectedMovie && (
                    <div className="modal-overlay">
                        <div
                            className="confirmation-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                        >
                            <h3 id="confirm-title">
                                Confirm Showtime
                            </h3>

                            <p>
                                Are you sure you want to schedule{" "}
                                <strong>{selectedMovie.title}</strong>?
                            </p>

                            <p>
                                <strong>Date:</strong> {formData.date}
                            </p>

                            <p>
                                <strong>Showroom:</strong>{" "}
                                {
                                    showrooms.find(
                                        (room) =>
                                            String(room.id) ===
                                            formData.showroom_id
                                    )?.name
                                }
                            </p>

                            <p>
                                <strong>Time:</strong>{" "}
                                {formatTime(formData.start_time)} –{" "}
                                {formatTime(endTime)}
                            </p>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmModal(false)
                                    }
                                    className="btn-cancel"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmScheduleShowtime}
                                    className="btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Scheduling..."
                                        : "Confirm & Schedule"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
