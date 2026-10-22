import express from "express";
import controller from "../controllers/movie.js";
import { extractJWT, optionalAuth } from '../middleware/extractJWT.js'

const router = express.Router();

router.get("/get/all", optionalAuth, controller.getAllMovies);
router.get("/get/:id", optionalAuth, controller.getMovie);
router.get("/favorites", extractJWT, controller.getAllFavorites);
router.post("/favorites/:movieId", extractJWT, controller.addFavorite);
router.delete("/favorites/:movieId", extractJWT, controller.deleteFavorite);

export default router;
