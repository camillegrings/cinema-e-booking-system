import React from "react";
import { Movie } from "../services/movie.js";
import { Link } from "react-router-dom";
import "./MovieCard.css";

interface Props {
	movie: Movie;
}

export const MovieCard: React.FC<Props> = ({ movie }) => {
	return (
		<div className='movie-card'>
			<div>
				<img
					src={movie.trailer_image_url}
					alt={movie.title}
					className='movie-poster'
					onError={(e) => {
						// Fallback image if placeholder URL fails to load
						(e.target as HTMLImageElement).src =
							"https://via.placeholder.com/200x300?text=No+Poster";
					}}
				/>
				<h3 className='movie-title'>{movie.title}</h3>
				<p className='movie-detail'>
					<strong>Genre:</strong> {movie.genre}
				</p>
				<p className='movie-detail'>
					<strong>Rating:</strong> {movie.mpaa_rating}
				</p>
			</div>

			<Link className="btn-details" to={`/movie/${movie.id}`}>View Details & Showtimes</Link>
		</div>
	);
};
