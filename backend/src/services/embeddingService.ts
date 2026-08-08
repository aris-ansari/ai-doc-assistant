import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export class EmbeddingService {
  /**
   * Generates a vector embedding array for a single string of text using Gemini.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error: unknown) {
      throw new AppError(
        `Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    }
  }

  /**
   * Generates vector embeddings for an array of text chunks sequentially.
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }
}

export const embeddingService = new EmbeddingService();
