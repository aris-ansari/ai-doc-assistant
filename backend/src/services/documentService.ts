import fs from "fs";
import {
  documentRepository,
  DocumentRepository,
} from "../repositories/documentRepository";
import { AppError } from "../utils/AppError";
import { IDocument } from "../models/Document";

export class DocumentService {
  private documentRepo: DocumentRepository;

  constructor(documentRepo = documentRepository) {
    this.documentRepo = documentRepo;
  }

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    title?: string,
  ): Promise<IDocument> {
    if (!file) {
      throw new AppError("No file provided", 400);
    }

    const documentName = title || file.originalname;

    const document = await this.documentRepo.create({
      userId: userId as any,
      title: documentName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath: file.path,
      status: "pending",
    });

    return document;
  }

  async getUserDocuments(userId: string): Promise<IDocument[]> {
    return this.documentRepo.findByUserId(userId);
  }

  async getDocumentById(
    userId: string,
    documentId: string,
  ): Promise<IDocument> {
    const document = await this.documentRepo.findById(documentId);

    if (!document) {
      throw new AppError("Document not found", 404);
    }

    if (document.userId.toString() !== userId) {
      throw new AppError("Unauthorized access to document", 403);
    }

    return document;
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await this.getDocumentById(userId, documentId);

    // Remove file from disk
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await this.documentRepo.delete(documentId);
  }
}

export const documentService = new DocumentService();
