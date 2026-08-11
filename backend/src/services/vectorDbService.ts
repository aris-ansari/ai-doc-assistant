import { DocumentChunk } from "../models/DocumentChunk.js";
import { AppError } from "../utils/AppError.js";

type ChunkMetadata = Record<string, string | number | boolean>;

interface VectorChunkInput {
  id: string;
  text: string;
  embedding: number[];
  metadata: ChunkMetadata;
}

interface SimilarityResult {
  documents: [string[]];
  metadatas: [ChunkMetadata[]];
}

export class VectorDbService {
  private readonly indexName = "document_chunks_vector_index";

  /**
   * Stores vector embeddings, raw chunk texts, and metadata in MongoDB.
   */
  async addChunks(chunks: VectorChunkInput[]): Promise<void> {
    if (chunks.length === 0) return;

    try {
      await DocumentChunk.insertMany(
        chunks.map((chunk) => ({
          chunkId: chunk.id,
          documentId: String(chunk.metadata.documentId),
          userId: String(chunk.metadata.userId),
          chunkIndex: Number(chunk.metadata.chunkIndex),
          text: chunk.text,
          embedding: chunk.embedding,
        })),
        {
          ordered: true,
        },
      );
    } catch (error: unknown) {
      throw new AppError(
        `Failed to store document vectors: ${
          error instanceof Error ? error.message : String(error)
        }`,
        500,
      );
    }
  }

  /**
   * Searches for the most semantically relevant text chunks
   * using MongoDB Atlas Vector Search.
   */
  async querySimilarity(
    queryEmbedding: number[],
    limit: number = 5,
    whereFilter?: Record<string, unknown>,
  ): Promise<SimilarityResult> {
    try {
      const results = await DocumentChunk.aggregate([
        {
          $vectorSearch: {
            index: this.indexName,
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: Math.max(limit * 20, 100),
            limit,
            ...(whereFilter ? { filter: whereFilter } : {}),
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            documentId: 1,
            userId: 1,
            chunkIndex: 1,
            score: {
              $meta: "vectorSearchScore",
            },
          },
        },
      ]);

      return {
        documents: [results.map((result: { text: string }) => result.text)],
        metadatas: [
          results.map(
            (result: {
              documentId: string;
              userId: string;
              chunkIndex: number;
            }) => ({
              documentId: result.documentId,
              userId: result.userId,
              chunkIndex: result.chunkIndex,
            }),
          ),
        ],
      };
    } catch (error: unknown) {
      throw new AppError(
        `Failed to query MongoDB Vector Search: ${
          error instanceof Error ? error.message : String(error)
        }`,
        500,
      );
    }
  }

  /**
   * Deletes all vector embeddings associated with a document.
   */
  async deleteByDocumentId(documentId: string): Promise<void> {
    try {
      await DocumentChunk.deleteMany({ documentId });
    } catch (error: unknown) {
      throw new AppError(
        `Failed to delete document vectors: ${
          error instanceof Error ? error.message : String(error)
        }`,
        500,
      );
    }
  }
}

export const vectorDbService = new VectorDbService();
