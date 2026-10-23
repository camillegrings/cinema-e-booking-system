import express from "express";
import controller from "../controllers/user.js";

const router = express.Router();

router.get("/validate", controller.validateToken);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/get/all", controller.getAllUsers);
router.post("/validate", controller.validateEmail);
router.post("/requestCode", controller.requestVerCode);
router.post("/resetPassword", controller.resetPassword);
router.post("/requestReset", controller.requestVerCode);

export default router;
