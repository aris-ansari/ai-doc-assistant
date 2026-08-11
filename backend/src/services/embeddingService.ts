import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export class EmbeddingService {
  /**
   * Generates a fixed-size vector embedding using Gemini Embedding 2.
   * The dimensionality is configured to remain compatible with the
   * MongoDB Atlas Vector Search index used by the document workspace.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await genAI.models.embedContent({
        model: env.GEMINI_EMBEDDING_MODEL,
        contents: text,
        config: {
          outputDimensionality: env.GEMINI_EMBEDDING_DIMENSIONS,
        },
      });

      const values = response.embeddings?.[0]?.values;
      if (!values?.length) {
        throw new Error("Gemini returned an empty embedding");
      }

      return values;
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
      embeddings.push(await this.generateEmbedding(text));
    }
    return embeddings;
  }
}

export const embeddingService = new EmbeddingService();
