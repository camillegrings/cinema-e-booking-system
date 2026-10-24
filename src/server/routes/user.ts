import express from "express";
import controller from "../controllers/user.js";

const router = express.Router();

router.get("/validate", controller.validateToken);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/get/all", controller.getAllUsers);
router.post("/verify", controller.verifyEmail);
router.post("/requestCode", controller.requestVerificationCode);
router.post("/resetPassword", controller.resetPassword);
router.post("/requestReset", controller.requestResetPasswordCode);

export default router;
