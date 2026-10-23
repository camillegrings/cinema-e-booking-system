import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import logging from "../db/logging.js";
import { Connect, Query } from "../db/db.js";
import { format } from "mysql2";
import * as Email from "../middleware/email.js";

const NAMESPACE = "Profile";

const toId = (value: unknown): number | null => {
	const n = Number(value);
	return Number.isInteger(n) && n > 0 ? n : null;
};

const getUserId = (res: Response): number | null => toId(res.locals.jwt?.id);

const fail = (res: Response, error: any) => {
	logging.error(NAMESPACE, error.message, error);

	return res.status(500).json({
		message: error.message,
		error,
	});
};

const encryptCard = (cardNumber: string): Buffer => {
	const key = Buffer.from(process.env.CARD_ENCRYPTION_KEY || "", "hex");
	if (key.length !== 32) {
		throw new Error("CARD_ENCRYPTION_KEY must be 64 hex characters");
	}
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([cipher.update(cardNumber, "utf8"), cipher.final()]);
	return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
};

const sendProfileChangedEmail = (email: string, what: string) => {
    Email.sendProfileChangedEmail(email, what).catch((error) => 
		logging.error(NAMESPACE, `Profile change email failed: ${error.message}`, error),
    );  
};

const isNonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;

const validAddress = (a: any) =>
	a && isNonEmpty(a.street) && isNonEmpty(a.city) && isNonEmpty(a.state) && isNonEmpty(a.zipCode);

const parseExpiration = (value: unknown): string | null => {
	const m = /^(\d{4})-(\d{2})(-\d{2})?$/.exec(String(value));
	if (!m) return null;
	const year = Number(m[1]);
	const month = Number(m[2]);
	if (month < 1 || month > 12) return null;
	if (new Date(year, month, 1) <= new Date()) return null;
	return `${m[1]}-${m[2]}-01`;
};

const run = (connection: any, sql: string, params: any[] = []) =>
	Query<any>(connection, format(sql, params), false);

const getProfile = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}

	Connect().then((connection) => {
		run(
			connection,
			`SELECT u.email, c.first_name, c.last_name, c.phone_number, c.status,
			        c.subscribed_to_promos, a.street, a.city, a.state, a.zip_code
			 FROM users u
			 JOIN customers c ON c.user_id = u.id
			 LEFT JOIN addresses a ON a.id = c.home_address_id
			 WHERE u.id = ?`,
			[userId],
		)
			.then((profiles) => {
				if (profiles.length === 0) {
					return res.status(404).json({ message: "Customer profile not found" });
				}

				const p = profiles[0];

				return run(
					connection,
					`SELECT p.id, p.slot, p.last_four, p.cardholder_name, p.expiration_date,
					        b.street, b.city, b.state, b.zip_code
					 FROM payment_cards p
					 JOIN addresses b ON b.id = p.billing_address_id
					 WHERE p.customer_id = ?
					 ORDER BY p.slot`,
					[userId],
				).then((cards) => {
					return res.status(200).json({
						email: p.email,
						firstName: p.first_name,
						lastName: p.last_name,
						phone: p.phone_number,
						status: p.status,
						subscribedToPromos: Boolean(p.subscribed_to_promos),
						address: p.street
							? { street: p.street, city: p.city, state: p.state, zipCode: p.zip_code }
							: null,
						cards: cards.map((c: any) => ({
							id: c.id,
							slot: c.slot,
							lastFour: c.last_four,
							cardholderName: c.cardholder_name,
							expirationDate: c.expiration_date,
							billingAddress: {
								street: c.street,
								city: c.city,
								state: c.state,
								zipCode: c.zip_code,
							},
						})),
					});
				});
			})
			.catch((error) => fail(res, error))
			.finally(() => connection.end());
	});
};

const updateProfile = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);
	const { firstName, lastName, phone, subscribedToPromos, address } = req.body;

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}

	if (!isNonEmpty(firstName) || !isNonEmpty(lastName) || !isNonEmpty(phone)) {
		return res
			.status(400)
			.json({ message: "First name, last name and phone number are required" });
	}

	if (address !== undefined && address !== null && !validAddress(address)) {
		return res
			.status(400)
			.json({ message: "Address needs street, city, state and zip code" });
	}

	Connect().then(async (connection) => {
		try {
			await run(connection, "START TRANSACTION");

			const current = await run(
				connection,
				`SELECT c.home_address_id, u.email
				 FROM customers c JOIN users u ON u.id = c.user_id
				 WHERE c.user_id = ?`,
				[userId],
			);

			if (current.length === 0) {
				await run(connection, "ROLLBACK");
				return res.status(404).json({ message: "Customer profile not found" });
			}

			let addressId: number | null = current[0].home_address_id;

			if (address === null) {
				addressId = null;
			} else if (address !== undefined) {
				if (addressId !== null) {
					await run(
						connection,
						"UPDATE addresses SET street = ?, city = ?, state = ?, zip_code = ? WHERE id = ?",
						[address.street, address.city, address.state, address.zipCode, addressId],
					);
				} else {
					const inserted = await run(
						connection,
						"INSERT INTO addresses (street, city, state, zip_code) VALUES (?, ?, ?, ?)",
						[address.street, address.city, address.state, address.zipCode],
					);
					addressId = inserted.insertId;
				}
			}

			await run(
				connection,
				`UPDATE customers
				 SET first_name = ?, last_name = ?, phone_number = ?,
				     subscribed_to_promos = ?, home_address_id = ?
				 WHERE user_id = ?`,
				[firstName.trim(), lastName.trim(), phone.trim(), subscribedToPromos ? 1 : 0, addressId, userId],
			);

			if (address === null && current[0].home_address_id !== null) {
				await run(connection, "DELETE FROM addresses WHERE id = ?", [
					current[0].home_address_id,
				]);
			}

			await run(connection, "COMMIT");

			sendProfileChangedEmail(current[0].email, "profile information");

			return res.status(200).json({ message: "Profile updated" });
		} catch (error: any) {
			try {
				await run(connection, "ROLLBACK");
			} catch {}
			return fail(res, error);
		} finally {
			connection.end();
		}
	});
};

const addCard = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);
	const { cardNumber, cardholderName, expirationDate, billingAddress } = req.body;

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}

	const digits = String(cardNumber || "").replace(/[\s-]/g, "");
	const expiration = parseExpiration(expirationDate);

	if (!/^\d{13,19}$/.test(digits)) {
		return res.status(400).json({ message: "Card number must be 13 to 19 digits" });
	}
	if (!isNonEmpty(cardholderName)) {
		return res.status(400).json({ message: "Cardholder name is required" });
	}
	if (expiration === null) {
		return res.status(400).json({ message: "Expiration date is invalid or expired" });
	}
	if (!validAddress(billingAddress)) {
		return res.status(400).json({ message: "Billing address is required" });
	}

	Connect().then(async (connection) => {
		try {
			await run(connection, "START TRANSACTION");

			const cards = await run(
				connection,
				"SELECT slot FROM payment_cards WHERE customer_id = ? FOR UPDATE",
				[userId],
			);

			if (cards.length >= 3) {
				await run(connection, "ROLLBACK");
				return res
					.status(400)
					.json({ message: "You can store at most 3 payment cards" });
			}

			const used = cards.map((c: any) => c.slot);
			const slot = [1, 2, 3].find((s) => !used.includes(s));

			const addr = await run(
				connection,
				"INSERT INTO addresses (street, city, state, zip_code) VALUES (?, ?, ?, ?)",
				[billingAddress.street, billingAddress.city, billingAddress.state, billingAddress.zipCode],
			);

			await run(
				connection,
				`INSERT INTO payment_cards
				 (customer_id, slot, card_number_enc, last_four, cardholder_name, expiration_date, billing_address_id)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[userId, slot, encryptCard(digits), digits.slice(-4), cardholderName.trim(), expiration, addr.insertId],
			);

			await run(connection, "COMMIT");

			const owner = await run(connection, "SELECT email FROM users WHERE id = ?", [userId]);
			sendProfileChangedEmail(owner[0].email, "payment cards");

			return res.status(201).json({ message: "Card added" });
		} catch (error: any) {
			try {
				await run(connection, "ROLLBACK");
			} catch {}
			return fail(res, error);
		} finally {
			connection.end();
		}
	});
};

const updateCard = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);
	const cardId = toId(req.params.cardId);
	const { cardNumber, cardholderName, expirationDate, billingAddress } = req.body;

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}
	if (cardId === null) {
		return res.status(400).json({ message: "Invalid card id" });
	}

	const expiration = parseExpiration(expirationDate);
	const digits = cardNumber ? String(cardNumber).replace(/[\s-]/g, "") : null;

	if (digits !== null && !/^\d{13,19}$/.test(digits)) {
		return res.status(400).json({ message: "Card number must be 13 to 19 digits" });
	}
	if (!isNonEmpty(cardholderName)) {
		return res.status(400).json({ message: "Cardholder name is required" });
	}
	if (expiration === null) {
		return res.status(400).json({ message: "Expiration date is invalid or expired" });
	}
	if (!validAddress(billingAddress)) {
		return res.status(400).json({ message: "Billing address is required" });
	}

	Connect().then(async (connection) => {
		try {
			await run(connection, "START TRANSACTION");

			const cards = await run(
				connection,
				"SELECT billing_address_id FROM payment_cards WHERE id = ? AND customer_id = ?",
				[cardId, userId],
			);

			if (cards.length === 0) {
				await run(connection, "ROLLBACK");
				return res.status(404).json({ message: "Card not found" });
			}

			await run(
				connection,
				"UPDATE addresses SET street = ?, city = ?, state = ?, zip_code = ? WHERE id = ?",
				[billingAddress.street, billingAddress.city, billingAddress.state, billingAddress.zipCode, cards[0].billing_address_id],
			);

			if (digits !== null) {
				await run(
					connection,
					`UPDATE payment_cards
					 SET card_number_enc = ?, last_four = ?, cardholder_name = ?, expiration_date = ?
					 WHERE id = ? AND customer_id = ?`,
					[encryptCard(digits), digits.slice(-4), cardholderName.trim(), expiration, cardId, userId],
				);
			} else {
				await run(
					connection,
					`UPDATE payment_cards SET cardholder_name = ?, expiration_date = ?
					 WHERE id = ? AND customer_id = ?`,
					[cardholderName.trim(), expiration, cardId, userId],
				);
			}

			await run(connection, "COMMIT");

			const owner = await run(connection, "SELECT email FROM users WHERE id = ?", [userId]);
			sendProfileChangedEmail(owner[0].email, "payment cards");

			return res.status(200).json({ message: "Card updated" });
		} catch (error: any) {
			try {
				await run(connection, "ROLLBACK");
			} catch {}
			return fail(res, error);
		} finally {
			connection.end();
		}
	});
};

const deleteCard = (req: Request, res: Response, next: NextFunction) => {
	const userId = getUserId(res);
	const cardId = toId(req.params.cardId);

	if (userId === null) {
		return res.status(401).json({ message: "Please log in" });
	}
	if (cardId === null) {
		return res.status(400).json({ message: "Invalid card id" });
	}

	Connect().then((connection) => {
		run(connection, "SELECT billing_address_id FROM payment_cards WHERE id = ? AND customer_id = ?", [
			cardId,
			userId,
		])
			.then((cards) => {
				if (cards.length === 0) {
					return res.status(404).json({ message: "Card not found" });
				}

				return run(connection, "DELETE FROM payment_cards WHERE id = ? AND customer_id = ?", [
					cardId,
					userId,
				])
					.then(() =>
						run(connection, "DELETE FROM addresses WHERE id = ?", [cards[0].billing_address_id]),
					)
					.then(() => run(connection, "SELECT email FROM users WHERE id = ?", [userId]))
					.then((owner) => {
						sendProfileChangedEmail(owner[0].email, "payment cards");

						return res.status(200).json({ message: "Card removed" });
					});
			})
			.catch((error) => fail(res, error))
			.finally(() => connection.end());
	});
};

export default { 
    getProfile, 
    updateProfile, 
    addCard, 
    updateCard, 
    deleteCard 
};
