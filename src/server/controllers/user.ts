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
import { randomInt } from "crypto";

const NAMESPACE = "User";

const validateToken = (req: Request, res: Response, next: NextFunction) => {
	logging.info(NAMESPACE, "Token validated, user authorized.");

	return res.status(200).json({
		message: "User validated",
	});
};

const requestVerCode = (req: Request, res: Response, next: NextFunction) => {
	let { email } = req.body;

	let query = `SELECT * FROM users WHERE email = "${email}" LIMIT 1`;

	Connect().then((connection) => {
		connection.beginTransaction((err) => {
			if (err) {
				throw err;
			}
			Query<IMySQLResult>(connection, query, false)
				.then(() => {
					const verificationCode = randomInt(100000, 999999).toString();
					let query = `INSERT INTO tokens (email, verification_code) VALUES ("${email}", "${verificationCode}")`;

					Query<IMySQLResult>(connection, query, false).then(() => {
						Email.sendVerificationCode(email, verificationCode);

						logging.info(NAMESPACE, "Verification code sent.");

						connection.commit((err) => {
							if (err) {
								connection.rollback(() => {
									throw err;
								});
							}
						});
						connection.end();
						return res.status(200).json({
							message: "Email sent",
						});
					});
				})
				.catch((error) => {
					connection.rollback(() => {
						logging.error(NAMESPACE, error.message, error);

						return res.status(500).json({
							message: error.message,
							error,
						});
					});
				});
		});
	});
};

const requestRPCode = (req: Request, res: Response, next: NextFunction) => {
	let { email } = req.body;

	let query = `SELECT * FROM users WHERE email = "${email}" LIMIT 1`;

	Connect().then((connection) => {
		connection.beginTransaction((err) => {
			if (err) {
				throw err;
			}
			Query<IMySQLResult>(connection, query, false)
				.then(() => {
					const verificationCode = randomInt(100000, 999999).toString();
					let query = `INSERT INTO tokens (email, verification_code) VALUES ("${email}", "${verificationCode}")`;

					Query<IMySQLResult>(connection, query, false).then(() => {
						Email.sendPasswordResetCode(email, verificationCode);

						logging.info(NAMESPACE, "Verification code sent.");

						connection.commit((err) => {
							if (err) {
								connection.rollback(() => {
									throw err;
								});
							}
						});
						connection.end();
						return res.status(200).json({
							message: "Email sent",
						});
					});
				})
				.catch((error) => {
					connection.rollback(() => {
						logging.error(NAMESPACE, error.message, error);

						return res.status(500).json({
							message: error.message,
							error,
						});
					});
				});
		});
	});
};

const validateEmail = (req: Request, res: Response, next: NextFunction) => {
	let { verification_code } = req.body;

	let query = `SELECT * FROM tokens WHERE verification_code = "${verification_code}" LIMIT 1`;

	Connect().then((connection) => {
		connection.beginTransaction((err) => {
			if (err) {
				throw err;
			}
			Query<IToken[]>(connection, query, false).then((token) => {
				if (!token.length) {
					return res.status(401).json({
						message: "Verification code does not exist.",
					});
				}

				let query = `SELECT * FROM users WHERE email = "${token[0]?.email}" LIMIT 1`;
				Query<IUser[]>(connection, query, false)
					.then((user) => {
						if (!user.length) {
							return res.status(401).json({
								message: "No user found.",
							});
						}

						let query = `UPDATE customers SET is_verified = TRUE WHERE user_id = "${user[0]?.id}"`;
						Query<QueryResult>(connection, query, false).then(() => {
							let query = `DELETE FROM tokens WHERE verification_code = "${verification_code}"`;
							Query<QueryResult>(connection, query, false).then(() => {
								logging.info(NAMESPACE, `User verification successful.`);

								connection.commit((err) => {
									if (err) {
										connection.rollback(() => {
											throw err;
										});
									}
								});
								connection.end();
								return res.status(200).json({
									message: "Email validated",
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
	});
};

const resetPassword = (req: Request, res: Response, next: NextFunction) => {
	let { new_password, verification_code } = req.body;
	let query = `SELECT * FROM tokens WHERE verification_code = "${verification_code}" LIMIT 1`;

	Connect().then((connection) => {
		connection.beginTransaction((err) => {
			if (err) {
				throw err;
			}
			Query<IToken[]>(connection, query, false).then((token) => {
				if (!token.length) {
					return res.status(401).json({
						message: "Verification code does not exist.",
					});
				}
				let query = `SELECT * FROM users WHERE email = "${token[0]?.email}" LIMIT 1`;
				Query<IUser[]>(connection, query, false)
					.then((user) => {
						if (!user.length) {
							return res.status(401).json({
								message: "No user found.",
							});
						}

						let query = `UPDATE customers SET is_verified = true WHERE user_id = "${user[0]?.id}"`;
						Query<QueryResult>(connection, query, false).then(() => {
							bcryptjs.hash(new_password, 10, (hashError, hash) => {
								if (hashError) {
									return res.status(401).json({
										message: hashError.message,
										error: hashError,
									});
								}
								let query = `UPDATE users SET password_hash = "${hash}" WHERE id = "${user[0]?.id}"`;
								Query<QueryResult>(connection, query, false).then(() => {
									let query = `DELETE FROM tokens WHERE verification_code = "${verification_code}"`;
									Query<QueryResult>(connection, query, false).then(() => {
										logging.info(NAMESPACE, `User verification successful.`);

										connection.commit((err) => {
											if (err) {
												connection.rollback(() => {
													throw err;
												});
											}
										});
										connection.end();
										return res.status(200).json({
											message: "Password updated.",
										});
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
					.then((user) => {
						let query = `INSERT INTO customers (user_id, first_name, last_name, phone_number) VALUES (${user?.insertId}, "${first_name}", "${last_name}", "${phone_number}")`;

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
								error,
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
				.then((user) => {
					if (!user.length) {
						return res.status(401).json({
							message: "Email or password is incorrect.",
						});
					}
					bcryptjs.compare(password, user[0].password_hash, (error, result) => {
						if (error) {
							return res.status(401).json({
								message: "Email or password is incorrect.",
							});
						} else if (result) {
							signJWT(user[0], (_error, token) => {
								if (_error) {
									return res.status(401).json({
										message: "Unable to Sign JWT",
										error: _error,
									});
								} else if (token) {
									return res.status(200).json({
										message: "Auth Successful",
										token,
										user: user[0],
									});
								}
							});
						}
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
	resetPassword,
};
