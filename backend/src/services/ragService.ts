import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { embeddingService } from "./embeddingService";
import { vectorDbService } from "./vectorDbService";
import { conversationRepository } from "../repositories/conversationRepository";
import { AppError } from "../utils/AppError";
import { IConversation, ISourceCitation } from "../models/Conversation";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class RagService {
  async createConversation(
    userId: string,
    title?: string,
    documentIds: string[] = [],
  ): Promise<IConversation> {
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
  ): Promise<{ conversation: IConversation; assistantMessage: any }> {
    const conversation = await this.getConversation(userId, conversationId);

    // Determine target document filter IDs
    const activeDocIds = documentIds?.length
      ? documentIds
      : conversation.documentIds.map((id) => id.toString());

    // 1. Generate query vector embedding
    const queryEmbedding = await embeddingService.generateEmbedding(userQuery);

    // 2. Query ChromaDB vector store for matching document chunks
    let whereFilter: Record<string, any> | undefined;
    if (activeDocIds.length === 1) {
      whereFilter = { documentId: activeDocIds[0] };
    } else if (activeDocIds.length > 1) {
      whereFilter = { documentId: { $in: activeDocIds } };
    }

    const queryResult = await vectorDbService.querySimilarity(
      queryEmbedding,
      5,
      whereFilter,
    );

    // 3. Extract relevant chunks & build citations
    const contextSnippets: string[] = [];
    const sources: ISourceCitation[] = [];

    if (queryResult.documents && queryResult.documents[0]) {
      queryResult.documents[0].forEach(
        (docText: string | null, idx: number) => {
          if (!docText) return;
          const metadata = queryResult.metadatas?.[0]?.[idx] as
            | Record<string, any>
            | undefined;
          contextSnippets.push(`[Source ${idx + 1}]: ${docText}`);

          if (metadata?.documentId) {
            sources.push({
              documentId: metadata.documentId,
              chunkIndex: metadata.chunkIndex ?? idx,
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);
    const assistantAnswer = response.response.text();

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

    return {
      conversation: updatedConversation!,
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
