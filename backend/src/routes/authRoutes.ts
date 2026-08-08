import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validations/authValidation.js";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
