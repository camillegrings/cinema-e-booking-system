import mysql from "mysql2";
import config from "./config.js";

const params = {
	user: config.mysql.user,
	password: config.mysql.pass,
	host: config.mysql.host,
	database: config.mysql.database,
};

const Connect = async () =>
	new Promise<mysql.Connection>((resolve, reject) => {
		const connection = mysql.createConnection(params);

		connection.connect((error) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(connection);
		});
	});

const Query = async <T>(
	connection: mysql.Connection,
	query: string,
	end: boolean = true,
) =>
	new Promise<T>((resolve, reject) => {
		connection.query(query, (error, result) => {
			if (error) {
				reject(error);
				return;
			}
			if (end) {
				connection.end();
			}
			resolve(result as T);
		});
	});

export { Connect, Query };
