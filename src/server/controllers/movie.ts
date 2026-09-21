import { NextFunction, Request, Response } from "express";
import logging from "../db/logging.js";
import { Connect, Query } from "../db/db.js";
import { Movie } from "../../client/services/movie.js";
import IMySQLResult from "../interfaces/result.js";
import { QueryResult } from "mysql2";

const NAMESPACE = "Movie";

const getAllMovies = (req: Request, res: Response, next: NextFunction) => {
	let query = "SELECT * FROM movies";

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((movies) => {
				return res.status(200).json(movies /*, count: movies.length */);
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
	const { id } = req.params

	let query = `SELECT * FROM movies WHERE id = ${id}`;

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((movies) => {
				return res.status(200).json(movies /*, count: movies.length */);
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

export default { getAllMovies, getMovie };
