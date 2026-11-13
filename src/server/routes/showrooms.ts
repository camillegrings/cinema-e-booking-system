import express from "express";
import controller from "../controllers/showroom.js";
import { extractJWT } from '../middleware/extractJWT.js'

const router = express.Router();

router.get("/get/all", extractJWT, controller.getAllShowrooms);

export default router;
