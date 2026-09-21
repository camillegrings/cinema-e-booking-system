import express from "express";
import controller from "../controllers/movie.js";

const router = express.Router();

router.get("/get/all", controller.getAllMovies);
router.get("/get/:id", controller.getMovie);

export default router;
