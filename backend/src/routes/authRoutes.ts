import { Router } from "express";
import { authController } from "../controllers/authController";
import { validate } from "../middlewares/validateMiddleware";
import { authenticate } from "../middlewares/authMiddleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validations/authValidation";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
