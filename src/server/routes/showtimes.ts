import express from "express";
import controller from "../controllers/showtimes.js";
import { extractJWT } from '../middleware/extractJWT.js'

const router = express.Router();

router.get("/", extractJWT, controller.getShowtimes);
router.post("/", extractJWT, controller.createShowtime);

export default router;
