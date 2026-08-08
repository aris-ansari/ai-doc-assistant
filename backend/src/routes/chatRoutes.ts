import { Router } from "express";
import { z } from "zod";
import { chatController } from "../controllers/chatController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createConversationSchema,
  sendMessageSchema,
} from "../validations/chatValidation.js";

const router = Router();

// Protect all chat routes
router.use(authenticate);

router.post(
  "/",
  validate(createConversationSchema),
  chatController.createConversation,
);
router.get("/", chatController.getConversations);
router.get(
  "/:id",
  validate(z.object({ params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid conversation ID") }) })),
  chatController.getConversationById,
);
router.post(
  "/:id/messages",
  validate(sendMessageSchema),
  chatController.sendMessage,
);
router.delete(
  "/:id",
  validate(z.object({ params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid conversation ID") }) })),
  chatController.deleteConversation,
);

export default router;
