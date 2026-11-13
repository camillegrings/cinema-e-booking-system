import { NextFunction, Request, Response } from "express";
import logging from "../db/logging.js";
import { Connect, Query } from "../db/db.js";
import { Movie } from "../../client/types/movie.js";
import IMySQLResult from "../interfaces/result.js";
import { QueryResult, ResultSetHeader, RowDataPacket, format } from "mysql2";

const NAMESPACE = "Movie";

const toId = (value: unknown): number | null => {
	const n = Number(value);
	return Number.isInteger(n) && n > 0 ? n : null;
};

// change the id if JWT stores user's id under a different key
const getUserId = (res: Response): number | null => toId(res.locals.jwt?.id);

const getAllMovies = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);
	let query = format(
		`SELECT m.*, (f.movie_id IS NOT NULL) AS is_favorite
		FROM movies m
		LEFT JOIN favorite_movies f
			ON f.movie_id = m.id AND f.customer_id = ?`,
		[userId],
	);

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((movies) => {
				return res.status(200).json(
					(movies as RowDataPacket[]).map((m) => ({
						...m,
						is_favorite: Boolean(m.is_favorite),
					})) /*, count: movies.length */,
				);
			})
			.catch((error) => {
				logging.error(NAMESPACE, error.message, error);

				return res.status(500).json({
					message: error.message,
					error,
				});
			});
	});
};

const getMovie = (req: Request, res: Response, next: NextFunction) => {
	const id = toId(req.params.id);

	if (id === null) {
		return res.status(400).json({ message: "Invalid movie id" });
	}

	const userId = getUserId(res);

	let query = format(
		`SELECT m.*, (f.movie_id IS NOT NULL) AS is_favorite
		FROM movies m
		LEFT JOIN favorite_movies f
			ON f.movie_id = m.id AND f.customer_id = ?
		WHERE m.id = ?`,
		[userId, id],
	);

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((movies) => {
				return res.status(200).json(
					(movies as RowDataPacket[]).map((m) => ({
						...m,
						is_favorite: Boolean(m.is_favorite),
					})) /*, count: movies.length */,
				);
			})
			.catch((error) => {
				logging.error(NAMESPACE, error.message, error);

				return res.status(500).json({
					message: error.message,
					error,
				});
			});
	});
};

const getMoviesPaginated = (req: Request, res: Response, next: NextFunction) => {
	// Pagination parameters
	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		50,
		Math.max(1, parseInt(req.query.limit as string) || 12)
	);
	const offset = (page - 1) * limit;

	// Filter parameters
	const search = (req.query.query as string || "").trim();
	const genre = req.query.genre as string;
	const status = req.query.status as string;
	const year = parseInt(req.query.year as string);

	// Build dynamic WHERE conditions
	const conditions: string[] = [];
	const params: any[] = [];

	if (search) {
		conditions.push("m.title LIKE ?");
		params.push(`%${search}%`);
	}

	if (genre) {
		conditions.push("m.genre = ?");
		params.push(genre);
	}

	if (status) {
		conditions.push("m.status = ?");
		params.push(status);
	}

	if (!isNaN(year) && year >= 1888 && year <= 2100) {
		conditions.push("m.release_date >= ? AND m.release_date < ?");
		params.push(`${year}-01-01`, `${year + 1}-01-01`);
	}

	const whereClause = conditions.length
		? `WHERE ${conditions.join(" AND ")}`
		: "";

	// Query to retrieve the movies for the current page
	const moviesQuery = format(
		`SELECT m.*
        FROM movies m
        ${whereClause}
        ORDER BY m.id DESC
        LIMIT ? OFFSET ?`,
		[...params, limit, offset]
	);

	// Query to count all movies matching the filters
	const countQuery = format(
		`SELECT COUNT(*) AS total
        FROM movies m
        ${whereClause}`,
		params
	);

	Connect().then((connection) => {
		connection.beginTransaction((err) => {
			if (err) {
				throw err;
			}
			Query<QueryResult>(connection, moviesQuery, false)
				.then((movies) => {
					Query<QueryResult>(connection, countQuery, false)
						.then((countResult) => {
							const total = (countResult as RowDataPacket[])[0]?.total ?? 0;

							return res.status(200).json({
								movies,
								pagination: {
									page,
									limit,
									total,
									totalPages: Math.ceil(total / limit),
								},
							});
						}).catch((error: any) => {
							logging.error(NAMESPACE, error.message, error);

							return res.status(500).json({
								message: error.message,
								error,
							});
						});
				}).catch((error: any) => {
					logging.error(NAMESPACE, error.message, error);

					return res.status(500).json({
						message: error.message,
						error,
					});
				});
		})
	})
};

/*
const getAllFavorites = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}

	let query = format(
		`SELECT m.*, f.date_added
		FROM favorite_movies f
		JOIN movies m ON m.id = f.movie_id
		WHERE f.customer_id = ?
		ORDER BY f.date_added DESC`,
		[userId],
	);
	*/

const getShowtimes = (req: Request, res: Response, next: NextFunction) => {
	const movieId = toId(req.params.id);

	if (movieId === null) {
		return res.status(400).json({ message: "Invalid movie id" });
	}

	let query = format(
		`SELECT 
            s.id,
            s.movie_id,
            s.showroom_id,
            s.show_time,
            s.duration,
            sr.name AS showroom_name
        FROM showtimes s
        LEFT JOIN showrooms sr ON s.showroom_id = sr.id
        WHERE s.movie_id = ?
        ORDER BY s.show_time ASC`,
		[movieId],
	);

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((movies) => {
				return res.status(200).json(
					(movies as RowDataPacket[]).map((m) => ({
						...m,
						is_favorite: true,
					})) /*, count: movies.length */,
				);
			})
			.catch((error) => {
				logging.error(NAMESPACE, error.message, error);

				return res.status(500).json({
					message: error.message,
					error,
				});
			});
	});
};

const getAllFavorites = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}

	let query = format(
		`SELECT m.*, f.date_added
        FROM favorite_movies f
        JOIN movies m ON m.id = f.movie_id
        WHERE f.customer_id = ?
        ORDER BY f.date_added DESC`,
		[userId],
	);

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((movies) => {
				return res.status(200).json(
					(movies as RowDataPacket[]).map((m) => ({
						...m,
						is_favorite: true,
					})),
				);
			})
			.catch((error) => {
				logging.error(NAMESPACE, error.message, error);

				return res.status(500).json({
					message: error.message,
					error,
				});
			});
	});
};

const addFavorite = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);
	const movieId = toId(req.params.movieId);

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}

	if (movieId === null) {
		return res.status(400).json({ message: "Invalid movie id" });
	}

	let query = format(
		"INSERT INTO favorite_movies (customer_id, movie_id) VALUES (?, ?)",
		[userId, movieId],
	);

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then(() => {
				return res.status(201).json({ message: "Added to favorites" });
			})
			.catch((error) => {
				if (error.code === "ER_DUP_ENTRY") {
					return res.status(200).json({ message: "Already in favorites" });
				}

				if (error.code === "ER_NO_REFERENCED_ROW_2") {
					return res
						.status(404)
						.json({ message: "Movie not found, or not a customer account" });
				}

				logging.error(NAMESPACE, error.message, error);

				return res.status(500).json({
					message: error.message,
					error,
				});
			});
	});
};

const deleteFavorite = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);
	const movieId = toId(req.params.movieId);

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}

	if (movieId === null) {
		return res.status(400).json({ message: "Invalid movie id" });
	}

	let query = format(
		"DELETE FROM favorite_movies WHERE customer_id = ? AND movie_id = ?",
		[userId, movieId],
	);

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((result) => {
				if ((result as ResultSetHeader).affectedRows === 0) {
					return res
						.status(404)
						.json({ message: "Movie was not in favorites" });
				}

				return res.status(200).json({ message: "Removed from favorites" });
			})
			.catch((error) => {
				logging.error(NAMESPACE, error.message, error);

				return res.status(500).json({
					message: error.message,
					error,
				});
			});
	});
};

const addMovie = (req: Request, res: Response, next: NextFunction) => {
	const {
		title,
		genre,
		cast,
		director,
		producer,
		synopsis,
		reviews,
		mpaa_rating,
		trailer_image_url,
		trailer_video_url,
		release_date,
		runtime_minutes,
		status,
	} = req.body;

	// Validate required fields
	if (
		!title ||
		!genre ||
		!mpaa_rating ||
		!release_date ||
		!status
	) {
		return res.status(400).json({
			message: "Please provide all required fields",
		});
	}

	// Validate MPAA rating
	const validRatings = ["G", "PG", "PG-13", "R", "NC-17"];

	if (!validRatings.includes(mpaa_rating)) {
		return res.status(400).json({
			message: "Invalid MPAA rating",
		});
	}

	// Validate movie status
	const validStatuses = ["Currently Running", "Coming Soon"];

	if (!validStatuses.includes(status)) {
		return res.status(400).json({
			message: "Invalid movie status",
		});
	}

	// Validate runtime
	const runtime = runtime_minutes ?? 120;

	if (!Number.isInteger(runtime) || runtime <= 0) {
		return res.status(400).json({
			message: "Runtime must be a positive integer",
		});
	}

	const query = format(
		`INSERT INTO movies (
            title,
            genre,
            cast,
            director,
            producer,
            synopsis,
            reviews,
            mpaa_rating,
            trailer_image_url,
            trailer_video_url,
            release_date,
            runtime_minutes,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			title,
			genre,
			cast ?? null,
			director ?? null,
			producer ?? null,
			synopsis ?? null,
			reviews ?? null,
			mpaa_rating,
			trailer_image_url ?? null,
			trailer_video_url ?? null,
			release_date,
			runtime,
			status,
		],
	);

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((result) => {
				return res.status(201).json({
					message: "Movie added successfully"
				});
			})
			.catch((error) => {
				logging.error(NAMESPACE, error.message, error);

				return res.status(500).json({
					message: "Failed to add movie",
					error: error.message,
				});
			});
	}).catch((error) => {
		logging.error(NAMESPACE, error.message, error);

		return res.status(500).json({
			message: "Database connection failed",
		});
	});
};

export default {
	getAllMovies,
	getMovie,
	getShowtimes,
	getAllFavorites,
	addFavorite,
	deleteFavorite,
	getMoviesPaginated,
	addMovie
};
