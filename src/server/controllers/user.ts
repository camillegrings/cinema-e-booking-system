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
import crypto from "crypto";

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
		connection.beginTransaction((err) => {
			if (err) {
				throw err;
			}
			Query<IToken[]>(connection, query)
				.then((result) => {
					const row = result[0];
					if (!row) {
						throw new Error("Verification token incorrect or expired.");
					}
					let query = `UPDATE customers SET is_verified = true WHERE user_id = ${row.user_id}`;
					Query<QueryResult>(connection, query)
						.then((result) => {
							let query = `DELETE FROM tokens WHERE verification_code = ${token}")`;
							Query<QueryResult>(connection, query)
								.then((result) => {
									logging.info(NAMESPACE, `User verification successful.`);

									return res.status(201).json(result);
								})
								.catch((error) => {
									connection.rollback(() => {
										logging.error(NAMESPACE, error.message, error);
										return res.status(401).json({
											message: "Deleting verification token failed.",
										});
									});
								});
						})
						.catch((error) => {
							connection.rollback(() => {
								logging.error(NAMESPACE, error.message, error);

								return res.status(401).json({
									message: "Verification failed.",
								});
							});
						});
				})
				.catch((error) => {
					connection.rollback(() => {
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
		connection.beginTransaction((err) => {
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
										connection.rollback(() => {
											logging.error(NAMESPACE, error.message, error);
											return res.status(401).json({
												message: "Deleting verification token failed.",
											});
										});
									});
							})

							.catch((error) => {
								connection.rollback(() => {
									logging.error(NAMESPACE, error.message, error);

									return res.status(401).json({
										message: "Verification failed.",
									});
								});
							});
					});
				})
				.catch((error) => {
					connection.rollback(() => {
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
			logging.error(NAMESPACE, hashError.message, "error");
			return res.status(401).json({
				message: hashError.message,
				error: hashError,
			});
		}

		let query = `INSERT INTO users (role, email, password_hash) VALUES ("CUSTOMER", "${email}", "${hash}")`;

		Connect().then((connection) => {
			connection.beginTransaction((err) => {
				if (err) {
					throw err;
				}
				Query<IMySQLResult>(connection, query, false)
					.then((users) => {
						let query = `INSERT INTO customers (user_id, first_name, last_name, phone_number, status) VALUES (${users?.insertId}, "${first_name}", "${last_name}", "${phone_number}", "ACTIVE")`;

						Query<IMySQLResult>(connection, query, false).then((result) => {
							logging.info(NAMESPACE, `User ${result?.insertId} inserted.`);
							connection.commit((err) => {
								if (err) {
									connection.rollback(() => {
										throw err;
									});
								}
							});
							connection.end();
							return res.status(200).json({
								message: "Registration successful.",
							});
						});
					})
					.catch((error) => {
						connection.rollback(() => {
							logging.error(NAMESPACE, "Register failed.", error);

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
					if (!users.length) {
						return res.status(401).json({
							message: "Email or password is incorrect.",
						});
					}
					const user = users[0];

					if (!user) {
						return res.status(401).json({
							message: "Email or password is incorrect.",
						});
					}

					bcryptjs.compare(password, user.password_hash, (error, result) => {
							if (error || !result) {
								return res.status(401).json({
									message: "Email or password is incorrect.",
								});
							}

							signJWT(user, (_error, token) => {
								if (_error) {
									return res.status(401).json({
										message: "Unable to Sign JWT",
										error: _error,
									});
								} else if (token) {
									return res.status(200).json({
										message: "Auth Successful",
										token,
										user: { id: user.id, email: user.email, role: user.role },
									});
								}
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
	let query = `SELECT id FROM users`;

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
