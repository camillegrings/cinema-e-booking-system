import { NextFunction, Request, Response } from "express";
import logging from "../db/logging.js";
import { Connect, Query } from "../db/db.js";
import { QueryResult, RowDataPacket, format } from "mysql2";

const NAMESPACE = "Showtimes";

const getShowtimes = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const date = req.query.date as string;
	const showroomId = parseInt(req.query.showroom_id as string);

	if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return res.status(400).json({
			message: "A valid date (YYYY-MM-DD) is required.",
		});
	}

	if (!showroomId || isNaN(showroomId)) {
		return res.status(400).json({
			message: "A valid showroom_id is required.",
		});
	}

	const query = format(
		`SELECT
            s.id,
            s.movie_id,
            m.title AS movie_title,
            s.showroom_id,
            sr.name AS showroom_name,
            DATE_FORMAT(s.show_time, '%Y-%m-%d %H:%i:%s') AS show_time,
			s.duration,
			DATE_FORMAT(s.end_time, '%Y-%m-%d %H:%i:%s') AS end_time
        FROM showtimes s
        INNER JOIN movies m
            ON s.movie_id = m.id
        INNER JOIN showrooms sr
            ON s.showroom_id = sr.id
        WHERE s.showroom_id = ?
            AND s.show_time >= ?
            AND s.show_time < DATE_ADD(?, INTERVAL 1 DAY)
        ORDER BY s.show_time ASC`,
		[showroomId, date, date]
	);

	Connect()
		.then((connection) => {
			Query<QueryResult>(connection, query)
				.then((showtimes) => {
					return res.status(200).json({
						showtimes: showtimes as RowDataPacket[],
					});
				})
				.catch((error) => {
					logging.error(NAMESPACE, error.message, error);

					return res.status(500).json({
						message: error.message,
						error,
					});
				});
		})
		.catch((error) => {
			logging.error(NAMESPACE, error.message, error);

			return res.status(500).json({
				message: error.message,
				error,
			});
		});
};

const createShowtime = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { movie_id, showroom_id, date, start_time } = req.body;

		// Validate required fields
		if (!movie_id || !showroom_id || !date || !start_time) {
			return res.status(400).json({
				message: "All fields are required.",
			});
		}

		if (
			!Number.isInteger(Number(movie_id)) ||
			!Number.isInteger(Number(showroom_id)) ||
			Number(movie_id) <= 0 ||
			Number(showroom_id) <= 0
		) {
			return res.status(400).json({
				message: "Invalid movie_id or showroom_id.",
			});
		}

		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return res.status(400).json({
				message: "Invalid date. Use YYYY-MM-DD.",
			});
		}

		if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(start_time)) {
			return res.status(400).json({
				message: "Invalid start_time. Use HH:mm or HH:mm:ss.",
			});
		}

		const showTime = `${date} ${start_time.length === 5 ? `${start_time}:00` : start_time
			}`;

		// Execute a query using a new connection
		const executeQuery = async (sql: string) => {
			const connection = await Connect();
			return Query<QueryResult>(connection, sql);
		};

		// 1. Retrieve movie runtime
		const movieQuery = format(
			`SELECT id, runtime_minutes
            FROM movies
            WHERE id = ?`,
			[movie_id]
		);

		const movieResult = await executeQuery(movieQuery);
		const movies = movieResult as RowDataPacket[];

		if (movies.length === 0) {
			return res.status(404).json({
				message: "Movie not found.",
			});
		}

		const duration = Number(movies[0].runtime_minutes);

		if (!Number.isFinite(duration) || duration <= 0) {
			return res.status(400).json({
				message: "The movie has an invalid runtime.",
			});
		}

		// 2. Check whether the showroom exists
		const showroomQuery = format(
			`SELECT id
            FROM showrooms
            WHERE id = ?`,
			[showroom_id]
		);

		const showroomResult = await executeQuery(showroomQuery);

		if ((showroomResult as RowDataPacket[]).length === 0) {
			return res.status(404).json({
				message: "Showroom not found.",
			});
		}

		// 3. Check for scheduling conflicts
		const conflictQuery = format(
			`SELECT id
            FROM showtimes
            WHERE showroom_id = ?
                AND end_time > DATE_SUB(?, INTERVAL 15 MINUTE)
                AND show_time < DATE_ADD(
                    DATE_ADD(?, INTERVAL ? MINUTE),
                    INTERVAL 15 MINUTE
                )
            LIMIT 1`,
			[showroom_id, showTime, showTime, duration]
		);

		const conflictResult = await executeQuery(conflictQuery);

		if ((conflictResult as RowDataPacket[]).length > 0) {
			return res.status(409).json({
				message: "This showroom already has a conflicting screening.",
			});
		}

		// 4. Insert the new showtime
		const insertQuery = format(
			`INSERT INTO showtimes (
                movie_id,
                showroom_id,
                show_time,
                duration
            ) VALUES (?, ?, ?, ?)`,
			[movie_id, showroom_id, showTime, duration]
		);

		const insertResult = await executeQuery(insertQuery);
		const showtimeId = (insertResult as any).insertId;

		return res.status(201).json({
			message: "Showtime scheduled successfully.",
			showtime: {
				id: showtimeId,
				movie_id: Number(movie_id),
				showroom_id: Number(showroom_id),
				show_time: showTime,
				duration,
			},
		});

	} catch (error: any) {
		logging.error(NAMESPACE, error.message, error);

		return res.status(500).json({
			message: error.message,
			error,
		});
	}
};


export default {
	getShowtimes,
	createShowtime
};
