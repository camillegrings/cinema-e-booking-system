import { NextFunction, Request, Response } from "express";
import logging from "../db/logging.js";

const NAMESPACE = "Home";

const home = (req: Request, res: Response, next: NextFunction) => {
	logging.info(NAMESPACE, "Cinema E-Booking API is running!");
	return res.status(200).json({
		message: "API up and running!",
	});
};

export default { home };
