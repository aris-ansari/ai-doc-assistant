import { parseDocumentText } from "../utils/documentParser.js";
import { chunkText } from "../utils/textSplitter.js";
import { embeddingService } from "./embeddingService.js";
import { vectorDbService } from "./vectorDbService.js";
import { documentRepository } from "../repositories/documentRepository.js";

export class DocumentProcessor {
  /**
   * Orchestrates full document pipeline: text extraction, chunking,
   * Gemini embedding generation, and MongoDB vector storage.
   */
  async processDocument(documentId: string): Promise<void> {
    try {
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      await documentRepository.update(documentId, {
        status: "processing",
        errorMessage: undefined,
      });

      // Remove vectors from an earlier failed/retried processing attempt before
      // generating the replacement set. This keeps retries idempotent.
      await vectorDbService.deleteByDocumentId(documentId);

      // 1. Extract raw text from file
      const extractedText = await parseDocumentText(
        document.filePath,
        document.mimeType,
      );

      // 2. Break text into overlapping chunks
      const chunks = chunkText(extractedText);

      if (extractedText.trim().length === 0 || chunks.length === 0) {
        throw new Error("Document contains no extractable text.");
      }

      // 3. Generate Gemini vector embeddings for chunks
      const chunkTexts = chunks.map((c) => c.text);
      const embeddings =
        await embeddingService.generateBatchEmbeddings(chunkTexts);

      const vectorData = chunks.map((chunk, index) => ({
        id: `${documentId}_chunk_${chunk.chunkIndex}`,
        text: chunk.text,
        embedding: embeddings[index],
        metadata: {
          documentId,
          userId: document.userId.toString(),
          chunkIndex: chunk.chunkIndex,
        },
      }));

      // 4. Store vectors and metadata in MongoDB
      await vectorDbService.addChunks(vectorData);

      // 5. Update document status to completed
      await documentRepository.update(documentId, {
        status: "completed",
        content: extractedText,
      });
    } catch (error: unknown) {
      console.error(`Error processing document ${documentId}:`, error);

      // A vector write can fail after inserting some chunks. Remove any
      // partial result so a later retry starts from a clean state.
      try {
        await vectorDbService.deleteByDocumentId(documentId);
      } catch (cleanupError: unknown) {
        console.error(
          `Failed to clean up vectors for document ${documentId}:`,
          cleanupError,
        );
      }

      await documentRepository.update(documentId, {
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Failed to process document",
      });
    }
  }
}

export const documentProcessor = new DocumentProcessor();
