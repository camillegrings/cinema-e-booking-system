import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Movie } from "../types/movie.js";
import { Header } from "../components/Header.js";
import { Link } from "react-router-dom";

import "./MovieDetails.css";

interface Showtime {
	id: number;
	movie_id: number;
	showroom_id: number;
	showroom_name: string;
	name?: string;
	hall_name?: string;
	show_time: string;
	duration: number;
	end_time?: string;
}

export const MovieDetails: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [movie, setMovie] = useState<Movie | undefined>();
	const [showtimes, setShowtimes] = useState<Showtime[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		setLoading(true);
		Promise.all([
			fetch(`http://localhost:3000/movies/get/${id}`).then(async (res) => {
				const data = await res.json();
				if (!res.ok) {
					console.error("Movie fetch returned status:", res.status, data);
					throw new Error(
						data.message || `Movie fetch failed with ${res.status}`,
					);
				}
				return data;
			}),
			fetch(`http://localhost:3000/movies/get/showtimes/${id}`)
				.then(async (res) => {
					if (!res.ok) {
						console.error(
							`Showtimes API error: received HTTP status ${res.status}`,
						);
						return [];
					}
					const data = await res.json();
					return Array.isArray(data) ? data : [];
				})
				.catch((err) => {
					console.warn("Could not load dynamic showtimes:", err);
					return [];
				}),
		])
			.then(([movieRes, showtimeRes]) => {
				console.log("Raw movie response:", movieRes);
				console.log("Raw showtimes response:", showtimeRes);

				// Handle both array response [{...}] and single object response {...}
				const foundMovie = Array.isArray(movieRes) ? movieRes[0] : movieRes;

				setMovie(foundMovie);
				setShowtimes(Array.isArray(showtimeRes) ? showtimeRes : []);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Error fetching movie details:", err);
				setMovie(undefined);
				setLoading(false);
			});
	}, [id]);

	const parseSafeDate = (timeStr: string) => {
		if (!timeStr) return new Date();
		const normalized = timeStr.includes("T")
			? timeStr
			: timeStr.replace(" ", "T");
		return new Date(normalized);
	};

	const formatDate = (dateStr: string) => {
		const d = parseSafeDate(dateStr);
		return isNaN(d.getTime())
			? dateStr
			: d.toLocaleDateString("en-US", {
					weekday: "short",
					month: "short",
					day: "numeric",
				});
	};

	const formatTime = (timeStr: string) => {
		const d = parseSafeDate(timeStr);
		return isNaN(d.getTime())
			? timeStr
			: d.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				});
	};

	const groupedShowtimes = showtimes.reduce(
		(acc: Record<string, Showtime[]>, item) => {
			const dateKey = item.show_time ? item.show_time.slice(0, 10) : "Upcoming";
			if (!acc[dateKey]) acc[dateKey] = [];
			acc[dateKey].push(item);
			return acc;
		},
		{},
	);

	if (loading) {
		return (
			<div className='movie-details-container'>
				<Header />
				<div className='movie-details-loading'>Loading movie...</div>
			</div>
		);
	}
	if (movie) {
		return (
			<div className='movie-details-container'>
				<Header />
				<div
					className='movie-details-banner'
					style={{ backgroundImage: `url(${movie.trailer_image_url})` }}
				>
					<div className='movie-details-banner-content'>
						<h1 className='movie-details-title'>{movie.title}</h1>
						<p className='movie-details-rating'>Rating: {movie.mpaa_rating}</p>
						<div>
							<Link to={"/"} className='back-btn'>
								{" "}
								Back{" "}
							</Link>
						</div>

						{(movie.status?.toLowerCase().includes("running") ||
							movie.status?.toLowerCase().includes("playing")) && (
							<div className='movie-details-showtimes-container'>
								<h3 className='movie-details-subtitle'>Available Showtimes</h3>

								{Object.keys(groupedShowtimes).length === 0 ? (
									<p className='movie-details-empty-showtimes'>
										No upcoming showtimes scheduled.
									</p>
								) : (
									Object.keys(groupedShowtimes)
										.sort()
										.map((dateKey) => (
											<div key={dateKey} className='showtime-date-group'>
												<h4 className='showtime-date-title'>
													{formatDate(dateKey)}
												</h4>
												<div className='movie-details-showtime-wrapper'>
													{groupedShowtimes[dateKey].map((st) => (
														<Link
															key={st.id}
															className='movie-details-showtime-badge'
															to={`/booking/${st.id}`}
															state={{
																movieTitle: movie.title,
																mpaaRating: movie.mpaa_rating,
																trailerImageUrl: movie.trailer_image_url,
																showroomName:
																	st.showroom_name ||
																	st.name ||
																	st.hall_name ||
																	`Showroom ${st.showroom_id}`,
																showTime: st.show_time,
															}}
														>
															<span className='badge-time'>
																{formatTime(st.show_time)}
															</span>
															<span className='badge-hall'>
																{st.showroom_name ||
																	st.name ||
																	st.hall_name ||
																	`Showroom ${st.showroom_id}`}
															</span>
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

				<div className='movie-details-content'>
					<div>
						<h3 className='movie-details-subtitle'>Synopsis</h3>
						<p>{movie.synopsis}</p>
						<h3 className='movie-details-subtitle'>Reviews</h3>
						<p>{movie.reviews}</p>
						<h3 className='movie-details-subtitle'>Cast</h3>
						<p>{movie.cast}</p>
						<h3 className='movie-details-subtitle'>Director</h3>
						<p>{movie.director}</p>
						<h3 className='movie-details-subtitle'>Producer</h3>
						<p>{movie.producer}</p>
					</div>
				</div>

				<div className='movie-details-trailer-wrapper'>
					<h3 className='movie-details-subtitle'>Trailer</h3>
					<iframe
						className='movie-details-iframe'
						src={movie.trailer_video_url}
						title={`${movie.title} Trailer`}
						allowFullScreen
					/>
				</div>
			</div>
		);
	}

	return (
		<div className='movie-details-container'>
			<Header />
			<div className='movie-details-not-found'>
				<p>Movie not found!</p>
			</div>
		</div>
	);
};
