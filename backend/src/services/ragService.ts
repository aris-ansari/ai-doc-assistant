import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { embeddingService } from "./embeddingService.js";
import { vectorDbService } from "./vectorDbService.js";
import { conversationRepository } from "../repositories/conversationRepository.js";
import { documentRepository } from "../repositories/documentRepository.js";
import { AppError } from "../utils/AppError.js";
import type {
  IConversation,
  IMessage,
  ISourceCitation,
} from "../models/Conversation.js";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export class RagService {
  async createConversation(
    userId: string,
    title?: string,
    documentIds: string[] = [],
  ): Promise<IConversation> {
    const ownedDocuments = await documentRepository.findByIdsAndUserId(
      documentIds,
      userId,
    );

    if (ownedDocuments.length !== new Set(documentIds).size) {
      throw new AppError(
        "One or more documents are not available to this user",
        403,
      );
    }

    return conversationRepository.create({ userId, title, documentIds });
  }

  async getUserConversations(userId: string): Promise<IConversation[]> {
    return conversationRepository.findByUserId(userId);
  }

  async getConversation(
    userId: string,
    conversationId: string,
  ): Promise<IConversation> {
    const conversation = await conversationRepository.findByIdAndUser(
      conversationId,
      userId,
    );
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }
    return conversation;
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    userQuery: string,
    documentIds?: string[],
  ): Promise<{ conversation: IConversation; assistantMessage: IMessage }> {
    const conversation = await this.getConversation(userId, conversationId);

    // Determine target document filter IDs
    const activeDocIds = documentIds?.length
      ? documentIds
      : conversation.documentIds.map((id) => id.toString());

    console.log("========== RAG DEBUG ==========");
    console.log("conversationId:", conversationId);
    console.log("request documentIds:", documentIds);
    console.log("conversation documentIds:", conversation.documentIds);
    console.log("activeDocIds:", activeDocIds);
    console.log("userId:", userId);
    console.log("================================");

    const ownedDocuments = await documentRepository.findByIdsAndUserId(
      activeDocIds,
      userId,
    );
    if (ownedDocuments.length !== new Set(activeDocIds).size) {
      throw new AppError(
        "One or more documents are not available to this user",
        403,
      );
    }

    // 1. Generate query vector embedding
    const queryEmbedding = await embeddingService.generateEmbedding(userQuery);

    // 2. Query MongoDB Atlas Vector Search for matching document chunks
    let whereFilter: Record<string, unknown>;

    if (activeDocIds.length === 1) {
      whereFilter = {
        documentId: activeDocIds[0],
      };
    } else if (activeDocIds.length > 1) {
      whereFilter = {
        documentId: { $in: activeDocIds },
      };
    } else {
      throw new AppError("No documents selected for this conversation", 400);
    }

    const queryResult = await vectorDbService.querySimilarity(
      queryEmbedding,
      5,
      whereFilter,
    );

    console.log("========== MONGODB VECTOR SEARCH RESULT ==========");
    console.log("whereFilter:", JSON.stringify(whereFilter));
    console.log("result documents:", queryResult.documents);
    console.log("result metadatas:", queryResult.metadatas);
    console.log("===================================");

    // 3. Extract relevant chunks & build citations
    const contextSnippets: string[] = [];
    const sources: ISourceCitation[] = [];

    if (queryResult.documents && queryResult.documents[0]) {
      queryResult.documents[0].forEach(
        (docText: string | null, idx: number) => {
          if (!docText) return;
          const metadata = queryResult.metadatas?.[0]?.[idx] as
            | Record<string, unknown>
            | undefined;
          contextSnippets.push(`[Source ${idx + 1}]: ${docText}`);

          if (typeof metadata?.documentId === "string") {
            sources.push({
              documentId: metadata.documentId,
              chunkIndex:
                typeof metadata.chunkIndex === "number"
                  ? metadata.chunkIndex
                  : idx,
              snippet: docText.substring(0, 150) + "...",
            });
          }
        },
      );
    }

    // 4. Construct grounded RAG prompt and call Gemini API
    const contextText = contextSnippets.join("\n\n");
    const prompt = `You are an AI assistant answering questions based on the provided document context.

Context from documents:
${contextText || "No relevant document snippets found."}

User Question: ${userQuery}

Instructions:
- Answer the user's question accurately using the context provided above whenever possible.
- If the answer cannot be found in the context, clearly state that based on the provided documents.
- Keep responses clear, concise, and helpful.`;

    const response = await genAI.models.generateContent({
      model: env.GEMINI_CHAT_MODEL,
      contents: prompt,
    });
    const assistantAnswer = response.text?.trim();

    if (!assistantAnswer) {
      throw new AppError("Gemini returned an empty response", 502);
    }

    // 5. Append messages to database history
    await conversationRepository.addMessage(conversationId, {
      sender: "user",
      content: userQuery,
    });

    const assistantMsg = {
      sender: "assistant" as const,
      content: assistantAnswer,
      sources,
    };

    const updatedConversation = await conversationRepository.addMessage(
      conversationId,
      assistantMsg,
    );

    if (!updatedConversation) {
      throw new AppError("Conversation no longer exists", 404);
    }

    return {
      conversation: updatedConversation,
      assistantMessage: assistantMsg,
    };
  }

  async deleteConversation(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    const deleted = await conversationRepository.delete(conversationId, userId);
    if (!deleted) {
      throw new AppError("Conversation not found", 404);
    }
  }
}

export const ragService = new RagService();
