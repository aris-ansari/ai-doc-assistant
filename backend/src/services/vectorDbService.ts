import { ChromaClient, Collection } from "chromadb";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export class VectorDbService {
  private client: ChromaClient;
  private collectionName = "document_workspace_chunks";

  constructor() {
    this.client = new ChromaClient({ path: env.CHROMA_URL });
  }

  private async getCollection(): Promise<Collection> {
    try {
      return await this.client.getOrCreateCollection({
        name: this.collectionName,
      });
    } catch (error: any) {
      throw new AppError(
        `Failed to access ChromaDB collection: ${error.message}`,
        500,
      );
    }
  }

  /**
   * Stores vector embeddings, raw chunk texts, and metadata in ChromaDB.
   */
  async addChunks(
    chunks: {
      id: string;
      text: string;
      embedding: number[];
      metadata: Record<string, any>;
    }[],
  ): Promise<void> {
    if (chunks.length === 0) return;

    const collection = await this.getCollection();
    await collection.add({
      ids: chunks.map((c) => c.id),
      embeddings: chunks.map((c) => c.embedding),
      documents: chunks.map((c) => c.text),
      metadatas: chunks.map((c) => c.metadata),
    });
  }

  /**
   * Searches for the most semantically relevant text chunks using cosine/Euclidean vector similarity.
   */
  async querySimilarity(
    queryEmbedding: number[],
    limit: number = 5,
    whereFilter?: Record<string, any>,
  ) {
    const collection = await this.getCollection();
    return await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      where: whereFilter,
    });
  }

  /**
   * Deletes all vector embeddings associated with a specific document ID.
   */
  async deleteByDocumentId(documentId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.delete({
      where: { documentId },
    });
  }
}

export const vectorDbService = new VectorDbService();
