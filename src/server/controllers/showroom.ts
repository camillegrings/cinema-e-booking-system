import { NextFunction, Request, Response } from "express";
import logging from "../db/logging.js";
import { Connect, Query } from "../db/db.js";
import { QueryResult, RowDataPacket, format } from "mysql2";

const NAMESPACE = "Showroom";

const getAllShowrooms = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const query = `
        SELECT
            s.id,
            s.theater_id,
            s.name,
            s.seat_count,
            t.name AS theater_name,
            t.location AS theater_location
        FROM showrooms s
        INNER JOIN theaters t
            ON s.theater_id = t.id
        ORDER BY t.name ASC, s.name ASC
    `;

	Connect().then((connection) => {
		Query<QueryResult>(connection, query)
			.then((showrooms) => {
				return res.status(200).json({
					showrooms: showrooms as RowDataPacket[],
				});
			})
			.catch((error) => {
				logging.error(NAMESPACE, error.message, error);

				return res.status(500).json({
					message: error.message,
					error,
				});
			});
	}).catch((error) => {
		logging.error(NAMESPACE, error.message, error);

		return res.status(500).json({
			message: error.message,
			error,
		});
	});
};


export default {
	getAllShowrooms,
};
