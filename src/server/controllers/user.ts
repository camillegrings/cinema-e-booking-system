import { NextFunction, Request, Response } from "express";
import bcryptjs from "bcryptjs";
import logging from "../db/logging.js";
import signJWT from "../middleware/signJWT.js";
import { Connect, Query } from "../db/db.js";
import { QueryResult } from "mysql2";
import * as Email from "../middleware/email.js";
import IUser from "../interfaces/user.js";
import IToken from "../interfaces/token.js";
import IMySQLResult from "../interfaces/result.js";

const NAMESPACE = "User";

const validateToken = (req: Request, res: Response, next: NextFunction) => {
	logging.info(NAMESPACE, "Token validated, user authorized.");

	return res.status(200).json({
		message: "Email validated",
	});
};

const requestVerCode = (req: Request, res: Response, next: NextFunction) => {
	var email = req.body;

	let query = `SELECT * FROM users WHERE email = ${email} LIMIT 1	`;

	Connect().then((connection) => {
		Query<IUser[]>(connection, query)
			.then((user) => {
				const verificationCode = crypto.randomInt(100000, 999999).toString();
				let query = `INSERT INTO tokens (email, verification_code) VALUES ("${email}", "${verificationCode}")`;

				Query<IUser[]>(connection, query)
					.then((user) => {
						Email.sendVerificationCode(email, verificationCode);

						logging.info(NAMESPACE, "Verification code sent.");

						return res.status(200).json({
							message: "Email sent",
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
	});
};

const requestRPCode = (req: Request, res: Response, next: NextFunction) => {
	var email = req.body;

	let query = `SELECT * FROM users WHERE email = ${email} LIMIT 1	`;

	Connect().then((connection) => {
		Query<IUser[]>(connection, query)
			.then((user) => {
				const verificationCode = crypto.randomInt(100000, 999999).toString();
				let query = `INSERT INTO tokens (email, verification_code) VALUES ("${email}", "${verificationCode}")`;

				Query<IUser[]>(connection, query)
					.then((user) => {
						Email.sendPasswordResetCode(email, verificationCode);

						logging.info(NAMESPACE, "Verification code sent.");

						return res.status(200).json({
							message: "Email sent",
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
	});
};

const validateEmail = (req: Request, res: Response, next: NextFunction) => {
	var token = req.query.token;

	let query = `SELECT * FROM tokens WHERE verification_code = ${token} LIMIT 1")`;

	Connect().then((connection) => {
		connection.beginTransaction(function (err) {
			if (err) {
				throw err;
			}
			Query<IToken[]>(connection, query)
				.then((result) => {
					let query = `UPDATE customers SET is_verified = true WHERE user_id = ${result[0].user_id}`;
					Query<QueryResult>(connection, query)
						.then((result) => {
							let query = `DELETE FROM tokens WHERE verification_code = ${token}")`;
							Query<QueryResult>(connection, query)
								.then((result) => {
									logging.info(NAMESPACE, `User verification successful.`);

									return res.status(201).json(result);
								})
								.catch((error) => {
									connection.rollback(function () {
										logging.error(NAMESPACE, error.message, error);
										return res.status(401).json({
											message: "Deleting verification token failed.",
										});
									});
								});
						})
						.catch((error) => {
							connection.rollback(function () {
								logging.error(NAMESPACE, error.message, error);

								return res.status(401).json({
									message: "Verification failed.",
								});
							});
						});
				})
				.catch((error) => {
					connection.rollback(function () {
						logging.error(NAMESPACE, error.message, error);

						return res.status(401).json({
							message: "Verification token incorrect or expired.",
						});
					});
				});
		});
	});
};

const resetPass = (req: Request, res: Response, next: NextFunction) => {
	let { email, new_password, token } = req.body;
	let query = `SELECT * FROM tokens WHERE verification_code = ${token} LIMIT 1")`;

	Connect().then((connection) => {
		connection.beginTransaction(function (err) {
			if (err) {
				throw err;
			}
			Query<IToken[]>(connection, query)
				.then((result) => {
					bcryptjs.hash(new_password, 10, (hashError, hash) => {
						if (hashError) {
							return res.status(401).json({
								message: hashError.message,
								error: hashError,
							});
						}

						let query = `UPDATE users SET password_hash = "${hash}" WHERE email = "${email}"`;
						Query<QueryResult>(connection, query)
							.then((result) => {
								let query = `DELETE FROM tokens WHERE verification_code = ${token}")`;
								Query<QueryResult>(connection, query)
									.then((result) => {
										logging.info(NAMESPACE, `User verification successful.`);

										return res.status(201).json(result);
									})
									.catch((error) => {
										connection.rollback(function () {
											logging.error(NAMESPACE, error.message, error);
											return res.status(401).json({
												message: "Deleting verification token failed.",
											});
										});
									});
							})

							.catch((error) => {
								connection.rollback(function () {
									logging.error(NAMESPACE, error.message, error);

									return res.status(401).json({
										message: "Verification failed.",
									});
								});
							});
					});
				})
				.catch((error) => {
					connection.rollback(function () {
						logging.error(NAMESPACE, error.message, error);

						return res.status(401).json({
							message: "Verification token incorrect or expired.",
						});
					});
				});
		});
	});
};

const register = (req: Request, res: Response, next: NextFunction) => {
	let { email, first_name, last_name, phone_number, password } = req.body;

	// const salt = await bcryptjs.genSalt(10);

	bcryptjs.hash(password, 10, (hashError, hash) => {
		if (hashError) {
			return res.status(401).json({
				message: hashError.message,
				error: hashError,
			});
		}

		let query = `INSERT INTO users (role, email, password_hash) VALUES ("CUSTOMER", "${email}", "${hash}")`;

		Connect().then((connection) => {
			connection.beginTransaction(function (err) {
				if (err) {
					throw err;
				}
				Query<QueryResult>(connection, query)
					.then((result) => {
						let query = `INSERT INTO customers (user_id, first_name, last_name, phone_number, status) VALUES (${result[0].user_id}, "${first_name}", "${last_name}", "${phone_number}", "ACTIVE")`;

						Query<IMySQLResult>(connection, query)
							.then((result) => {
								logging.info(
									NAMESPACE,
									`User with id ${result.insertId} inserted.`,
								);

								return res.status(201).json(result);
							})
							.catch((error) => {
								connection.rollback(function () {
									logging.error(NAMESPACE, error.message, error);

									return res.status(401).json({
										message: "Register failed.",
									});
								});
							});
					})
					.catch((error) => {
						connection.rollback(function () {
							logging.error(NAMESPACE, error.message, error);

							return res.status(401).json({
								message: "Register failed.",
							});
						});
					});
			});
		});
	});
};

const login = (req: Request, res: Response, next: NextFunction) => {
	let { email, password } = req.body;

	let query = `SELECT * FROM users WHERE email = '${email}' LIMIT 1`;

	Connect()
		.then((connection) => {
			Query<IUser[]>(connection, query)
				.then((users) => {
					bcryptjs.compare(
						password,
						users[0].password_hash,
						(error, result) => {
							if (error) {
								return res.status(401).json({
									message: "Password Mismatch",
								});
							} else if (result) {
								signJWT(users[0], (_error, token) => {
									if (_error) {
										return res.status(401).json({
											message: "Unable to Sign JWT",
											error: _error,
										});
									} else if (token) {
										return res.status(200).json({
											message: "Auth Successful",
											token,
											user: users[0],
										});
									}
								});
							}
						},
					);
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

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
	let query = `SELECT id, username FROM users`;

	Connect()
		.then((connection) => {
			Query<IUser[]>(connection, query)
				.then((users) => {
					return res.status(200).json({
						users,
						count: users.length,
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

export default {
	validateToken,
	register,
	login,
	getAllUsers,
	validateEmail,
	requestVerCode,
	requestRPCode,
	resetPass,
};
