import { Router } from "express";
import { chatController } from "../controllers/chatController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import {
  createConversationSchema,
  sendMessageSchema,
} from "../validations/chatValidation";

const router = Router();

// Protect all chat routes
router.use(authenticate);

router.post(
  "/",
  validate(createConversationSchema),
  chatController.createConversation,
);
router.get("/", chatController.getConversations);
router.get("/:id", chatController.getConversationById);
router.post(
  "/:id/messages",
  validate(sendMessageSchema),
  chatController.sendMessage,
);
router.delete("/:id", chatController.deleteConversation);

export default router;
