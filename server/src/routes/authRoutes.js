import express from "express";
import { login, loginSchema, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", protect, me);

export default router;
