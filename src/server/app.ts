import express from "express";
import http from "http";
import bodyParser from "body-parser";
import logging from "./db/logging.js";
import config from "./db/config.js";
import userRoutes from "./routes/user.js";
import homeRoutes from "./routes/home.js";
import movieRoutes from "./routes/movie.js";

const NAMESPACE = "Server";
const router = express();

router.use((req, res, next) => {
	// Log the request
	logging.info(
		NAMESPACE,
		`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`,
	);

	res.on("finish", () => {
		// Log the response
		logging.info(
			NAMESPACE,
			`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`,
		);
	});

	next();
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// API Rules
router.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization",
	);

	if (req.method == "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
		return res.status(200).json({});
	}

	next();
});

// Routes go here
router.use("/", homeRoutes); // so like this highkey does not do anything bc it isnt being called by HomePage.tsx lol
router.use("/movies", movieRoutes);
router.use("/users", userRoutes);

// Error handling
router.use((req, res, next) => {
	const error = new Error("Not found");

	res.status(404).json({
		message: error.message,
	});
});

const httpServer = http.createServer(router);

httpServer.listen(config.server.port, () =>
	logging.info(
		NAMESPACE,
		`Server is running ${config.server.hostname}:${config.server.port}`,
	),
);
