import { Response } from "express";
import { documentService } from "../services/documentService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

export class DocumentController {
  uploadDocument = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const file = req.file as Express.Multer.File;
      const { title } = req.body;

      const document = await documentService.uploadDocument(
        userId,
        file,
        title,
      );

      sendSuccess({
        res,
        statusCode: 201,
        message: "Document uploaded successfully",
        data: { document },
      });
    },
  );

  getDocuments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const documents = await documentService.getUserDocuments(userId);

      sendSuccess({
        res,
        message: "Documents retrieved successfully",
        data: { documents },
      });
    },
  );

  getDocumentById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const { id } = req.params;

      const document = await documentService.getDocumentById(userId, id);

      sendSuccess({
        res,
        message: "Document retrieved successfully",
        data: { document },
      });
    },
  );

  retryDocumentProcessing = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const { id } = req.params;

      const document = await documentService.retryDocumentProcessing(
        userId,
        id,
      );

      sendSuccess({
        res,
        statusCode: 202,
        message: "Document processing restarted",
        data: { document },
      });
    },
  );

  deleteDocument = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const { id } = req.params;

      await documentService.deleteDocument(userId, id);

      sendSuccess({
        res,
        message: "Document deleted successfully",
      });
    },
  );
}

export const documentController = new DocumentController();
