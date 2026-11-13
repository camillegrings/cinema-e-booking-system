
import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { Header } from "../components/Header.js";
import "./ManageMovie.css";
import { useAuth } from "../context/AuthContext.js";

type MovieFormData = {
    title: string;
    genre: string;
    cast: string;
    director: string;
    producer: string;
    synopsis: string;
    reviews: string;
    mpaa_rating: string;
    trailer_image_url: string;
    trailer_video_url: string;
    release_date: string;
    runtime_minutes: string;
};

type MovieStatus = "Currently Running" | "Coming Soon";

type Message = {
    text: string;
    type: "success" | "error";
} | null;

type ValidationErrors = Partial<Record<keyof MovieFormData, string>>;

const INITIAL_FORM_DATA: MovieFormData = {
    title: "",
    genre: "Sci-Fi",
    cast: "",
    director: "",
    producer: "",
    synopsis: "",
    reviews: "",
    mpaa_rating: "G",
    trailer_image_url: "",
    trailer_video_url: "",
    release_date: "",
    runtime_minutes: "",
};

const MAX_RUNTIME = 600;

export const ManageMovie: React.FC = () => {
    const { token } = useAuth();

    const [formData, setFormData] =
        useState<MovieFormData>({ ...INITIAL_FORM_DATA });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [message, setMessage] = useState<Message>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviewError, setImagePreviewError] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage(null);
        }, 4000); // Disappears after 4 seconds

        return () => clearTimeout(timer);
    }, [message]);

    // Get today's date in local timezone (YYYY-MM-DD)
    const getTodayDate = (): string => {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // Automatically calculate movie status based on release date
    const getMovieStatus = (releaseDate: string): MovieStatus => {
        return releaseDate > getTodayDate()
            ? "Coming Soon"
            : "Currently Running";
    };

    // Validate HTTP/HTTPS URLs
    const isValidUrl = (value: string): boolean => {
        try {
            const url = new URL(value.trim());

            return (
                url.protocol === "http:" ||
                url.protocol === "https:"
            );
        } catch {
            return false;
        }
    };

    // Validate release date
    const isValidDate = (date: string): boolean => {
        const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (!match) return false;

        const [, year, month, day] = match;

        const parsedDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return (
            parsedDate.getFullYear() === Number(year) &&
            parsedDate.getMonth() === Number(month) - 1 &&
            parsedDate.getDate() === Number(day)
        );
    };

    // Handle input changes
    const handleInputChange = (
        e: ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setMessage(null);

        if (name === "trailer_image_url") {
            setImagePreviewError(false);
        }
    };

    // Validate all form fields
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Required text fields
        if (!formData.title.trim()) {
            newErrors.title = "Movie title is required.";
        }

        if (!formData.genre.trim()) {
            newErrors.genre = "Please select a genre.";
        }

        if (!formData.mpaa_rating.trim()) {
            newErrors.mpaa_rating = "Please select an MPAA rating.";
        }

        if (!formData.synopsis.trim()) {
            newErrors.synopsis = "Movie synopsis is required.";
        }

        // Release date
        if (!formData.release_date) {
            newErrors.release_date = "Release date is required.";
        } else if (!isValidDate(formData.release_date)) {
            newErrors.release_date = "Please enter a valid release date.";
        }

        // Runtime
        const runtime = Number(formData.runtime_minutes);

        if (!formData.runtime_minutes.trim()) {
            newErrors.runtime_minutes = "Runtime is required.";
        } else if (
            !Number.isInteger(runtime) ||
            runtime <= 0 ||
            runtime > MAX_RUNTIME
        ) {
            newErrors.runtime_minutes =
                `Runtime must be a whole number between 1 and ${MAX_RUNTIME} minutes.`;
        }

        // Trailer image URL
        if (!formData.trailer_image_url.trim()) {
            newErrors.trailer_image_url =
                "Trailer image URL is required.";
        } else if (!isValidUrl(formData.trailer_image_url)) {
            newErrors.trailer_image_url =
                "Please enter a valid HTTP or HTTPS image URL.";
        }

        // Trailer video URL
        if (!formData.trailer_video_url.trim()) {
            newErrors.trailer_video_url =
                "Trailer video URL is required.";
        } else if (!isValidUrl(formData.trailer_video_url)) {
            newErrors.trailer_video_url =
                "Please enter a valid HTTP or HTTPS video URL.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        if (!validateForm()) {
            setMessage({
                text: "Please correct the highlighted fields.",
                type: "error",
            });
            return;
        }

        setShowConfirmModal(true);
    };

    // Submit movie to backend
    const confirmSaveMovie = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);

        try {
            const fullFormData = {
                ...formData,
                title: formData.title.trim(),
                cast: formData.cast.trim(),
                director: formData.director.trim(),
                producer: formData.producer.trim(),
                synopsis: formData.synopsis.trim(),
                reviews: formData.reviews.trim(),
                trailer_image_url: formData.trailer_image_url.trim(),
                trailer_video_url: formData.trailer_video_url.trim(),
                runtime_minutes: Number(formData.runtime_minutes),
                status: getMovieStatus(formData.release_date),
            };

            const response = await fetch("http://localhost:3000/movies/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(fullFormData),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add movie."
                );
            }

            setMessage({
                text: "Movie added successfully! The movie is now available for scheduling.",
                type: "success",
            });

            // Reset form after successful submission
            setFormData({ ...INITIAL_FORM_DATA });
            setErrors({});
            setImagePreviewError(false);

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

    return (
        <div className="manage-movie-page">
            <Header />
            <main className="manage-movie-container">
                <h2>Add Movie</h2>

                <p className="form-description">
                    Enter the movie information below to add it to the
                    movie catalog.
                    Fields marked with * are required.
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
                    className="manage-movie-form"
                    noValidate
                >
                    {/* MOVIE INFORMATION */}
                    <section className="form-section">
                        <h3>Movie Information</h3>

                        <div className="input-group">
                            <label htmlFor="title">
                                Title *
                            </label>

                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter movie title"
                                maxLength={150}
                                required
                                aria-invalid={!!errors.title}
                                aria-describedby={
                                    errors.title ? "title-error" : undefined
                                }
                            />

                            {errors.title && (
                                <span id="title-error" className="field-error">
                                    {errors.title}
                                </span>
                            )}
                        </div>

                        <div className="fields-wrapper">
                            <div className="input-group">
                                <label htmlFor="genre">
                                    Genre *
                                </label>

                                <select
                                    className="select"
                                    id="genre"
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleInputChange}
                                    required
                                    aria-invalid={!!errors.genre}
                                    aria-describedby={
                                        errors.genre ? "genre-error" : undefined
                                    }
                                >
                                    <option value="Sci-Fi">Sci-Fi</option>
                                    <option value="Action">Action</option>
                                    <option value="Horror">Horror</option>
                                    <option value="Romance">Romance</option>
                                    <option value="Animation">Animation</option>
                                    <option value="Fantasy">Fantasy</option>
                                    <option value="Thriller">Thriller</option>
                                </select>

                                {errors.genre && (
                                    <span id="genre-error" className="field-error">
                                        {errors.genre}
                                    </span>
                                )}
                            </div>

                            <div className="input-group">
                                <label htmlFor="mpaa_rating">
                                    MPAA Rating *
                                </label>

                                <select
                                    className="select"
                                    id="mpaa_rating"
                                    name="mpaa_rating"
                                    value={formData.mpaa_rating}
                                    onChange={handleInputChange}
                                    required
                                    aria-invalid={!!errors.mpaa_rating}
                                    aria-describedby={
                                        errors.mpaa_rating
                                            ? "rating-error"
                                            : undefined
                                    }
                                >
                                    <option value="G">G</option>
                                    <option value="PG">PG</option>
                                    <option value="PG-13">PG-13</option>
                                    <option value="R">R</option>
                                    <option value="NC-17">NC-17</option>
                                </select>

                                {errors.mpaa_rating && (
                                    <span
                                        id="rating-error"
                                        className="field-error"
                                    >
                                        {errors.mpaa_rating}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="fields-wrapper">
                            <div className="input-group">
                                <label htmlFor="release_date">
                                    Release Date *
                                </label>

                                <input
                                    type="date"
                                    id="release_date"
                                    name="release_date"
                                    value={formData.release_date}
                                    onChange={handleInputChange}
                                    required
                                    aria-invalid={!!errors.release_date}
                                    aria-describedby={
                                        errors.release_date
                                            ? "release-date-error"
                                            : "release-date-help"
                                    }
                                />

                                <small
                                    id="release-date-help"
                                    className="field-hint"
                                >
                                    The movie status is automatically
                                    determined by this date.
                                </small>

                                {errors.release_date && (
                                    <span
                                        id="release-date-error"
                                        className="field-error"
                                    >
                                        {errors.release_date}
                                    </span>
                                )}

                                {formData.release_date &&
                                    isValidDate(formData.release_date) && (
                                        <p className="status-preview">
                                            Movie Status:{" "}
                                            <strong>
                                                {getMovieStatus(
                                                    formData.release_date
                                                )}
                                            </strong>
                                        </p>
                                    )}
                            </div>

                            <div className="input-group">
                                <label htmlFor="runtime_minutes">
                                    Runtime (minutes) *
                                </label>

                                <input
                                    type="number"
                                    id="runtime_minutes"
                                    name="runtime_minutes"
                                    value={formData.runtime_minutes}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 120"
                                    min="1"
                                    max={MAX_RUNTIME}
                                    step="1"
                                    required
                                    aria-invalid={!!errors.runtime_minutes}
                                    aria-describedby={
                                        errors.runtime_minutes
                                            ? "runtime-error"
                                            : undefined
                                    }
                                />

                                {errors.runtime_minutes && (
                                    <span
                                        id="runtime-error"
                                        className="field-error"
                                    >
                                        {errors.runtime_minutes}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="synopsis">
                                Synopsis *
                            </label>

                            <textarea
                                id="synopsis"
                                name="synopsis"
                                value={formData.synopsis}
                                onChange={handleInputChange}
                                placeholder="Write a brief description of the movie..."
                                maxLength={3000}
                                rows={5}
                                required
                                aria-invalid={!!errors.synopsis}
                                aria-describedby={
                                    errors.synopsis
                                        ? "synopsis-error"
                                        : "synopsis-help"
                                }
                            />

                            <small id="synopsis-help" className="field-hint">
                                {formData.synopsis.length}/3000 characters
                            </small>

                            {errors.synopsis && (
                                <span
                                    id="synopsis-error"
                                    className="field-error"
                                >
                                    {errors.synopsis}
                                </span>
                            )}
                        </div>
                    </section>

                    {/* CAST AND PRODUCTION */}
                    <section className="form-section">
                        <h3>Cast & Production</h3>

                        <div className="input-group">
                            <label htmlFor="cast">
                                Cast
                            </label>

                            <input
                                type="text"
                                id="cast"
                                name="cast"
                                value={formData.cast}
                                onChange={handleInputChange}
                                placeholder="Enter cast members"
                                maxLength={1000}
                            />

                            <small className="field-hint">
                                Separate multiple actors with commas.
                            </small>
                        </div>

                        <div className="input-group">
                            <label htmlFor="director">
                                Director
                            </label>

                            <input
                                type="text"
                                id="director"
                                name="director"
                                value={formData.director}
                                onChange={handleInputChange}
                                placeholder="Enter director name"
                                maxLength={150}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="producer">
                                Producer
                            </label>

                            <input
                                type="text"
                                id="producer"
                                name="producer"
                                value={formData.producer}
                                onChange={handleInputChange}
                                placeholder="Enter producer name"
                                maxLength={150}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="reviews">
                                Reviews
                            </label>

                            <textarea
                                id="reviews"
                                name="reviews"
                                value={formData.reviews}
                                onChange={handleInputChange}
                                placeholder="Add movie reviews or additional comments..."
                                maxLength={3000}
                                rows={4}
                            />
                        </div>
                    </section>

                    {/* TRAILER INFORMATION */}
                    <section className="form-section">
                        <h3>Trailer Information</h3>

                        <div className="input-group">
                            <label htmlFor="trailer_image_url">
                                Trailer Image URL *
                            </label>

                            <input
                                type="url"
                                id="trailer_image_url"
                                name="trailer_image_url"
                                value={formData.trailer_image_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/movie-poster.jpg"
                                maxLength={2048}
                                required
                                aria-invalid={!!errors.trailer_image_url}
                                aria-describedby={
                                    errors.trailer_image_url
                                        ? "image-url-error"
                                        : undefined
                                }
                            />

                            {errors.trailer_image_url && (
                                <span
                                    id="image-url-error"
                                    className="field-error"
                                >
                                    {errors.trailer_image_url}
                                </span>
                            )}

                            {/* Image preview */}
                            {formData.trailer_image_url &&
                                isValidUrl(formData.trailer_image_url) && (
                                    <div className="image-preview">
                                        <p>Image Preview</p>

                                        {imagePreviewError ? (
                                            <p className="field-error">
                                                Unable to load image. Please
                                                check the URL.
                                            </p>
                                        ) : (
                                            <img
                                                src={formData.trailer_image_url}
                                                alt="Movie poster preview"
                                                onError={() =>
                                                    setImagePreviewError(true)
                                                }
                                            />
                                        )}
                                    </div>
                                )}
                        </div>

                        <div className="input-group">
                            <label htmlFor="trailer_video_url">
                                Trailer Video URL *
                            </label>

                            <input
                                type="url"
                                id="trailer_video_url"
                                name="trailer_video_url"
                                value={formData.trailer_video_url}
                                onChange={handleInputChange}
                                placeholder="https://www.youtube.com/embed/..."
                                maxLength={2048}
                                required
                                aria-invalid={!!errors.trailer_video_url}
                                aria-describedby={
                                    errors.trailer_video_url
                                        ? "video-url-error"
                                        : undefined
                                }
                            />

                            {errors.trailer_video_url && (
                                <span
                                    id="video-url-error"
                                    className="field-error"
                                >
                                    {errors.trailer_video_url}
                                </span>
                            )}
                        </div>
                    </section>

                    {/* FORM ACTIONS */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            disabled={isSubmitting}
                            onClick={() => {
                                setFormData({ ...INITIAL_FORM_DATA });
                                setErrors({});
                                setMessage(null);
                                setImagePreviewError(false);
                            }}
                        >
                            Clear Form
                        </button>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Saving..."
                                : "Save New Movie"}
                        </button>
                    </div>
                </form>
                {showConfirmModal && (
                    <div className="modal-overlay">
                        <div
                            className="confirmation-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                        >
                            <h3 id="confirm-title">
                                Confirm Movie Publication
                            </h3>

                            <p>
                                Are you sure you want to add
                                <strong> {formData.title} </strong>
                                to the movie catalog?
                            </p>

                            <p>
                                Once saved, this movie will automatically
                                appear on the customer homepage.
                            </p>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmSaveMovie}
                                    className="btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Publishing..." : "Confirm & Publish"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
