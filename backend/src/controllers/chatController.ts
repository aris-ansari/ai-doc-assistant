import { Response } from "express";
import { ragService } from "../services/ragService";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export class ChatController {
  createConversation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const { title, documentIds } = req.body;

      const conversation = await ragService.createConversation(
        userId,
        title,
        documentIds,
      );

      sendSuccess({
        res,
        statusCode: 201,
        message: "Conversation created successfully",
        data: { conversation },
      });
    },
  );

  getConversations = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const conversations = await ragService.getUserConversations(userId);

      sendSuccess({
        res,
        message: "Conversations retrieved successfully",
        data: { conversations },
      });
    },
  );

  getConversationById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const { id } = req.params;

      const conversation = await ragService.getConversation(userId, id);

      sendSuccess({
        res,
        message: "Conversation retrieved successfully",
        data: { conversation },
      });
    },
  );

  sendMessage = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { message, documentIds } = req.body;

      const result = await ragService.sendMessage(
        userId,
        id,
        message,
        documentIds,
      );

      sendSuccess({
        res,
        message: "Message processed successfully",
        data: result,
      });
    },
  );

  deleteConversation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const { id } = req.params;

      await ragService.deleteConversation(userId, id);

      sendSuccess({
        res,
        message: "Conversation deleted successfully",
      });
    },
  );
}

export const chatController = new ChatController();
