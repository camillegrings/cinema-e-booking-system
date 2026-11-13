import express from "express";
import controller from "../controllers/movie.js";
import { extractJWT, optionalAuth } from '../middleware/extractJWT.js'

const router = express.Router();

router.get("/get/all", optionalAuth, controller.getAllMovies);
router.get("/get/showtimes/:id", optionalAuth, controller.getShowtimes);
router.get("/get/:id", optionalAuth, controller.getMovie);
router.get("/catalog", extractJWT, controller.getMoviesPaginated);
router.post("/add", extractJWT, controller.addMovie);
router.get("/favorites", extractJWT, controller.getAllFavorites);
router.post("/favorites/:movieId", extractJWT, controller.addFavorite);
router.delete("/favorites/:movieId", extractJWT, controller.deleteFavorite);

export default router;
