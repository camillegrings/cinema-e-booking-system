import express from "express";
import controller from "../controllers/user.js";
import profile from "../controllers/profile.js";
import { extractJWT } from "../middleware/extractJWT.js";

const router = express.Router();

router.get("/validate", controller.validateToken);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/get/all", controller.getAllUsers);
router.post("/verify", controller.verifyEmail);
router.post("/requestCode", controller.requestVerificationCode);
router.post("/resetPassword", controller.resetPassword);
router.post("/requestReset", controller.requestResetPasswordCode);
router.post("/validate", controller.validateEmail);
router.post("/verify", controller.requestVerCode);
router.post("/forgot-password", controller.requestRPCode);
router.post("/reset-password", controller.resetPass);
router.get("/profile", extractJWT, profile.getProfile);
router.put("/profile", extractJWT, profile.updateProfile);
router.post("/profile/cards", extractJWT, profile.addCard);
router.put("/profile/cards/:cardId", extractJWT, profile.updateCard);
router.delete("/profile/cards/:cardId", extractJWT, profile.deleteCard);

export default router;
