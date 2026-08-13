import fs from "fs/promises";
import "multer";
import {
  documentRepository,
  DocumentRepository,
} from "../repositories/documentRepository.js";
import { documentProcessor } from "./documentProcessor.js";
import { vectorDbService } from "./vectorDbService.js";
import { AppError } from "../utils/AppError.js";
import { IDocument } from "../models/Document.js";
import { Types } from "mongoose";

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
      userId: new Types.ObjectId(userId),
      title: documentName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath: file.path,
      status: "pending",
    });

    // Trigger asynchronous parsing and vector embedding in background
    documentProcessor.processDocument(document._id.toString()).catch((err) => {
      console.error(`Background processing failed for ${document._id}:`, err);
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

  async retryDocumentProcessing(
    userId: string,
    documentId: string,
  ): Promise<IDocument> {
    const document = await this.getDocumentById(userId, documentId);

    if (document.status === "processing") {
      throw new AppError(
        "Document is already being processed. Please wait until processing finishes.",
        409,
      );
    }

    if (document.status === "completed") {
      throw new AppError(
        "Document has already been processed successfully.",
        409,
      );
    }

    // Start the same processor used by the upload flow. The processor owns
    // status transitions, vector cleanup, and failure handling.
    documentProcessor.processDocument(documentId).catch((err) => {
      console.error(`Retry processing failed for ${documentId}:`, err);
    });

    return (await this.documentRepo.findById(documentId)) ?? document;
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await this.getDocumentById(userId, documentId);

    // Do not delete a document while its background processor is reading the
    // file or writing vectors. Otherwise the processor could finish after the
    // deletion and recreate orphaned chunks for a document that no longer exists.
    if (document.status === "processing") {
      throw new AppError(
        "Document is still processing. Please wait until processing finishes before deleting it.",
        409,
      );
    }

    // Delete associated vector embeddings from MongoDB
    await vectorDbService.deleteByDocumentId(documentId);

    // Remove local file from storage disk
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      const code =
        error instanceof Error && "code" in error ? error.code : undefined;
      if (code !== "ENOENT") {
        throw error;
      }
    }

    await this.documentRepo.delete(documentId);
  }
}

export const documentService = new DocumentService();
