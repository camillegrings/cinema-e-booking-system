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

export default {
	getAllMovies,
	getMovie,
	getAllFavorites,
	addFavorite,
	deleteFavorite,
};
